//!imporoved branch handling 

import { octokit } from './github';
//this is gotta take a github URL and give us back the list of files in it
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'; //this will load the github repo and give us back the list of files in it
import dotenv from 'dotenv';
dotenv.config();

export const getDefaultBranch = async (githubUrl: string, githubToken?: string): Promise<string> => {
    const token: string = githubToken ?? process.env.GITHUB_TOKEN ?? '';

    const [owner, repo] = githubUrl.replace('https://github.com/', '').split('/') as [string, string];

    if (!owner || !repo) {
        throw new Error('Invalid GitHub repository URL');
    }

    const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo,
        headers: {
            authorization: `Bearer ${token}`,
        },
    });

    return response.data.default_branch;
};


export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const token = githubToken || process.env.GITHUB_TOKEN || '';
    const defaultBranch = await getDefaultBranch(githubUrl, token);
    
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: token, 
        branch: defaultBranch,
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true, //this will make sure we get every single file
        unknown: 'ignore', //other is warn {this will give us a warning if we find a file that we don't know how to handle}
        maxConcurrency: 5 //this will make sure we don't overload the server
    });
    const docs = await loader.load();
    return docs;
};

console.log(await loadGithubRepo('https://github.com/SamikshaSingh25/tic-tac-toe')); //testing function to return the list of 


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







//! base code which i wrote earily 
// //this is gotta take a github URL and give us back the list of files in it
// import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'; //this will load the github repo and give us back the list of files in it
// import dotenv from 'dotenv';
// dotenv.config();

// export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
//     const loader = new GithubRepoLoader(githubUrl, {
//         accessToken: githubToken || process.env.GITHUB_TOKEN || '', //loading github token 
//         branch: 'main',
//         ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
//         recursive: true, //this will make sure we get every single file
//         unknown: 'warn', //other is warn {this will give us a warning if we find a file that we don't know how to handle}
//         maxConcurrency: 5 //this will make sure we don't overload the server
//     });
//     const docs = await loader.load();
//     return docs;
// };

// console.log(await loadGithubRepo('https://github.com/SamikshaSingh25/tic-tac-toe')); //testing function to return the list of 

