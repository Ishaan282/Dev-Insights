import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { pollCommits } from '@/lib/github';
import { indexGithubRepo } from '@/lib/github-loader';

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
        return project
    }),
    
    //route 2 - for getting all projects
    getProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null //if deleted at is null then only show the project
            } //getting all projects of the user
        })
    }),

    //route 3 - for getting commits
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error); 
        return await ctx.db.commit.findMany({where : {projectId : input.projectId}})
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
    deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string()})).mutation(async ({ctx, input}) => {
        return await ctx.db.meeting.delete({where: {id: input.meetingId}})
    }),
    getMeetingById: protectedProcedure.input(z.object({ meetingId: z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findUnique({where: {id: input.meetingId}, include: {issues: true}})
    }),

//! more routes 
    //route 6
    archiveProject: protectedProcedure.input(z.object({projectId:z.string()})).mutation(async ({ctx, input}) => {
        return await ctx.db.project.update({ where: {id: input.projectId}, data: {deletedAt: new Date()}})
    }), //this is gonna delete the project

//# delete project
// deleteProject: protectedProcedure
//     .input(z.object({ projectId: z.string() }))
//     .mutation(async ({ ctx, input }) => {
//         const { projectId } = input;

//         try {
//             const deletedProject = await ctx.db.project.delete({
//                 where: { id: projectId },
//             });
//             return { success: true, deletedProject };
//         } catch (error) {
//             // Narrow down the type of `error` before accessing its properties
//             if (error instanceof Error) {
//                 throw new Error(`Failed to delete project: ${error.message}`);
//             } else {
//                 throw new Error(`Failed to delete project: An unknown error occurred`);
//             }
//         }
//     }),
}) //we create this router to have communication with frontend