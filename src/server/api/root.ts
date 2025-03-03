//THis files is like main.tsx in react and it exports all the routes 
import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { projectRouter } from "./routers/project";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  project: projectRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;


export const createCaller = createCallerFactory(appRouter);
