//this file handels project routes using trpc
import { z } from 'zod'; //zod is used for validation
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { pollCommits } from '@/lib/github';
import { checkCredits, indexGithubRepo } from '@/lib/github-loader';

export const projectRouter = createTRPCRouter({
    //route 1 - for creating a project
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ctx , input}) => {
        const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId!}, select: {credits: true} })
        if(!user){
            throw new Error("user not found")
        }

        const currentCredits = user.credits || 0
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)

        if(currentCredits < fileCount){
            throw new Error("not enough credits")
        }

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
        await ctx.db.user.update({where: {id: ctx.user.userId!}, data: {credits: { decrement: fileCount} } })
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


    //route 2.1 :- getting achived projects 
    getArchiveProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: {not : null} //only return soft deleted project 
            }
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
        return await ctx.db.project.update({ where: {id: input.projectId}, data: {deletedAt: new Date()}})
    }), //this is gonna delete the project

    unArchiveProject: protectedProcedure.input(z.object({projectId: z.string()})).mutation(async ({ctx,input}) => {
        return await ctx.db.project.update({ where: {id: input.projectId}, data: {deletedAt: null}})
    }),

    //route 7
    getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx,input}) => {
        return await ctx.db.userToProject.findMany({where: { projectId: input.projectId}, include: {user: true} })
    }),

//! billing routes
    getMyCredits: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.user.findUnique({where: {id: ctx.user.userId!}, select: {credits: true}})
    }),

//$checking credits 
    checkCredits: protectedProcedure.input(z.object({githubUrl: z.string(), githubToken: z.string().optional()})).mutation( async ({ctx,input}) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)
        const userCredits = await ctx.db.user.findUnique({ where: { id: ctx.user.userId!}, select: { credits: true} })
        return {fileCount, userCredits: userCredits?.credits || 0}
    })


}) //we create this router to have communication with frontend