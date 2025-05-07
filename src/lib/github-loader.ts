import { SourceCodeEmbedding } from './../../node_modules/.prisma/client/index.d';
//!this file is gonna take a github URL and give us back the list of files in it 

import { octokit } from './github';
//this is gotta take a github URL and give us back the list of files in it
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'; //this will load the github repo and give us back the list of files in it
import { Document } from '@langchain/core/documents'
import dotenv from 'dotenv';
import { summariseCode , generateEmbedding } from './gemini';
import { db } from '@/server/db';
import { Octokit } from 'octokit';
dotenv.config();

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
    const { data } = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    })
    // If it's a file (not an array), return acc + 1 since it's a single file
    if(!Array.isArray(data) && data.type === 'file'){
        return acc + 1
    }
    //if there are multiple files inside the folder 
    if(Array.isArray(data)){
        let fileCount = 0;
        const directories : string[] = []

        for(const item of data){
            if(item.type === 'dir'){ // If item is a directory, add its path to the list
                directories.push(item.path)
            } else{
                fileCount++
            }
        } //total files in a repo

         // If there are subdirectories, recurse into each one using getFileCount
        if(directories.length > 0){
            const directoryCounts = await Promise.all(
                directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
                )
                fileCount += directoryCounts.reduce((acc,count) => acc + count, 0)
        }
        return acc + fileCount
        //if more than one directory 
    }

    return acc;
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    //finding how mnay files in an repo 
    const octokit = new Octokit({auth: githubToken || process.env.GITHUB_TOKEN})
    const githubOwner = githubUrl.split('/')[3]
    const githubRepo = githubUrl.split('/')[4]
    if(!githubOwner || !githubRepo) {
        return 0;
    }
    const fileCount = await getFileCount('',octokit, githubOwner, githubRepo,0)
    return fileCount
}


export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const accessToken = githubToken || process.env.GITHUB_TOKEN || '';
    const branchesToTry = ['master', 'main']; // List of branches to try

    let docs: Document[] | undefined;
    let lastError: Error | undefined;

    // Try each branch in sequence
    for (const branch of branchesToTry) {
        try {
            const loader = new GithubRepoLoader(githubUrl, {
                accessToken,
                branch,
                ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', '.vscode'],
                recursive: true,
                unknown: 'ignore',
                maxConcurrency: 5,
            });
            docs = await loader.load();
            break; // Exit the loop if loading succeeds
        } catch (error) {
            if (error instanceof Error) {
                lastError = error; // Save the error and try the next branch
            } else {
                // Handle cases where the error is not an Error object
                lastError = new Error('An unknown error occurred');
            }
        }
    }

    if (!docs) {
        throw new Error(`Failed to load repository: ${lastError?.message || 'Unknown error'}`);
    }

    return docs;
};

//#test
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

//!format of github files  
// Document {
//     pageContent: "# Rock-Paper-Scissors\nChallenge the Computer, Master Rock Paper Scissors!\n",
//     metadata: {
//       source: "README.md",
//       repository: "https://github.com/SamikshaSingh25/Rock-Paper-Scissors",
//       branch: "main",
//     },
//     id: undefined,
//   },


//console.log(await loadGithubRepo('https://github.com/SamikshaSingh25/tic-tac-toe')); //testing function to return the list of 

// console.log(process.env.GITHUB_TOKEN)