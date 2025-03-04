import { SourceCodeEmbedding } from './../../node_modules/.prisma/client/index.d';
//!imporoved branch handling 

import { octokit } from './github';
//this is gotta take a github URL and give us back the list of files in it
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'; //this will load the github repo and give us back the list of files in it
import { Document } from '@langchain/core/documents'
import dotenv from 'dotenv';
import { summariseCode , generateEmbedding } from './gemini';
import { db } from '@/server/db';
dotenv.config();

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || process.env.GITHUB_TOKEN || '', //loading github token 
        branch: 'master',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb','.vscode'],
        recursive: true, //this will make sure we get every single file
        unknown: 'warn', //other is warn {this will give us a warning if we find a file that we don't know how to handle}
        maxConcurrency: 5 //this will make sure we don't overload the server
    });
    const docs = await loader.load();
    return docs;
};



//console.log(await loadGithubRepo('https://github.com/SamikshaSingh25/tic-tac-toe')); //testing function to return the list of 
export const indexGithubRepo = async(projectId: string,githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs);
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} of ${allEmbeddings.length}`);
        if(!embedding) return 

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
            }
        })

        //sql query to update the summary embedding  in sql
        await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

//gonna take a docume , then generates a ai embeddings
const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,

        }
    }))
} //this gets the summary + embeds the summary to database

//!format of each file returned 
// Document {
//     pageContent: "# Rock-Paper-Scissors\nChallenge the Computer, Master Rock Paper Scissors!\n",
//     metadata: {
//       source: "README.md",
//       repository: "https://github.com/SamikshaSingh25/Rock-Paper-Scissors",
//       branch: "main",
//     },
//     id: undefined,
//   },


// console.log(await loadGithubRepo('https://github.com/SamikshaSingh25/tic-tac-toe')); //testing function to return the list of 

