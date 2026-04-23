//this file handels project routes using trpc
import { z } from 'zod'; //zod is used for validation
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { pollCommits } from '@/lib/github';
import { indexGithubRepo } from '@/lib/github-loader';
import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from '@/server/db';

export const projectRouter = createTRPCRouter({
    //route 1 - for creating a project
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ctx , input}) => {
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create: {
                        userId : ctx.user.userId!,
                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id);
        revalidateTag(`projects-${ctx.user.userId}`);
        revalidateTag(`commits-${project.id}`);
        return project
    }),

    //route 2 - for getting all projects
    getProjects: protectedProcedure.query(async ({ctx}) => {
        const userId = ctx.user.userId!;
        return unstable_cache(
            () => db.project.findMany({
                where: {
                    userToProjects: { some: { userId } },
                    deletedAt: null
                }
            }),
            [`projects-${userId}`],
            { tags: [`projects-${userId}`], revalidate: 300 }
        )();
    }),

    //route 2.1 :- getting achived projects
    getArchiveProjects: protectedProcedure.query(async ({ctx}) => {
        const userId = ctx.user.userId!;
        return unstable_cache(
            () => db.project.findMany({
                where: {
                    userToProjects: { some: { userId } },
                    deletedAt: { not: null }
                }
            }),
            [`archive-projects-${userId}`],
            { tags: [`projects-${userId}`], revalidate: 300 }
        )();
    }),

    //route 3 - for getting commits
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ctx, input}) => {
        const { projectId } = input;
        return unstable_cache(
            () => db.commit.findMany({ where: { projectId } }),
            [`commits-${projectId}`],
            { tags: [`commits-${projectId}`], revalidate: 300 }
        )();
    }),

    //route 4
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId! //$we ! sign for non-null assertion

            }
        })
    }),

    //route 5
    getQuestions: protectedProcedure.input(z.object({ projectId: z.string() }))
    .query(async ({ctx,input}) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId
            }, 
            include : {
                user: true
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
    }),
//!meeting routes (not completed due to firebase )
    uploadMeeting: protectedProcedure.input(z.object({projectId: z.string(), meetingUrl: z.string(), name: z.string()}))
        .mutation(async({ctx, input}) => {
            const meeting = await ctx.db.meeting.create({
                data: {
                    meetingUrl: input.meetingUrl,
                    projectId: input.projectId,
                    name: input.name,
                    status: "PROCESSING"
                }
            })
            return meeting
        }),


    getMeetings: protectedProcedure.input(z.object({ projectId: z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findMany({where: {projectId: input.projectId}, include: {issues: true} })
    }),
    // deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string()})).mutation(async ({ctx, input}) => {
    //     return await ctx.db.meeting.delete({where: {id: input.meetingId}})
    // }),

    deleteMeeting: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Step 1: Delete all issues associated with this meeting
            await ctx.db.issue.deleteMany({
            where: {
                meetingId: input.meetingId
            }
            });

            // Step 2: Delete the meeting itself
            const deletedMeeting = await ctx.db.meeting.delete({
            where: {
                id: input.meetingId
            }
            });

            return deletedMeeting;
        }),

    getMeetingById: protectedProcedure.input(z.object({ meetingId: z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findUnique({where: {id: input.meetingId}, include: {issues: true}})
    }),

//! archive project & team collaborators
    //route 6
    archiveProject: protectedProcedure.input(z.object({projectId:z.string()})).mutation(async ({ctx, input}) => {
        const result = await ctx.db.project.update({ where: {id: input.projectId}, data: {deletedAt: new Date()}});
        revalidateTag(`projects-${ctx.user.userId}`);
        return result;
    }),

    unArchiveProject: protectedProcedure.input(z.object({projectId: z.string()})).mutation(async ({ctx,input}) => {
        const result = await ctx.db.project.update({ where: {id: input.projectId}, data: {deletedAt: null}});
        revalidateTag(`projects-${ctx.user.userId}`);
        return result;
    }),

    //route 7
    getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx,input}) => {
        const { projectId } = input;
        return unstable_cache(
            () => db.userToProject.findMany({ where: { projectId }, include: { user: true } }),
            [`team-${projectId}`],
            { tags: [`team-${projectId}`], revalidate: 300 }
        )();
    }),

}) //we create this router to have communication with frontend