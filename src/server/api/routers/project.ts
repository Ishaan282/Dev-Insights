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
    getQuestions: protectedProcedure.input(z.object({projectId:z.string()}))
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
    })
}) //we create this router to have communication with frontend