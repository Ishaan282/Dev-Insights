// console.log("hello");
import { db } from '@/server/db';
import { Octokit} from 'octokit';
import axios from 'axios';
import { aisummariseCommit } from './gemini';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
}); //passing github token 
//this file is to get the commits from the github repository
// const githubUrl = 'https://github.com/docker/genai-stack' //url of the repository

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAutherAvatar: string;
    commitDate: string;
}
//getting the commits 
export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    //https://github.com/<owner>/<repo>/commits
    const [owner,repo] = githubUrl.split('/').slice(-2);
    if(!owner || !repo){
        throw new Error('Invalid github url');
    }
    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    // console.log(data); //testing 
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[];

    return sortedCommits.slice(0,10).map((commit: any) => ({ //getting first 10 commits
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAutherAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""
    }))
}

// console.log(await getCommitHashes(githubUrl)); //calling the commits and testing in cosole

//# polling commits from github and saving them to the database
export const pollCommits = async (projectId: string) => {
    const {project,githubUrl} = await fetchProjectGithubUrl(projectId);
    const commitHashes =  await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes); //compare new commits with our database so this will save ai token for commit summary
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
        return summariseCommit(githubUrl, commit.commitHash)
    }))
    const summaries = summaryResponses.map((response) => {
        if(response.status === 'fulfilled'){
            return response.value as string;
        }
        return "";
    }) //getting the summaries of the commits

    //@saving the commits to the database
    const commits = await db.commit.createMany({
        data: summaries.map((summary , index) => {
            console.log(`processing commit ${index}`)
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAutherAvatar: unprocessedCommits[index]!.commitAutherAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary: summary
            }
        })
    })
    // console.log(unprocessedCommits);
    return commits;
}

//!function to pass the data to api 
async function summariseCommit(githubUrl: string , commitHash: string){
    //getting diff. then pass the diff to ai
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    return await aisummariseCommit(data) || "";
}

async function fetchProjectGithubUrl(projectId: string){
    const project = await db.project.findUnique({
        where: { id: projectId},
        select: { githubUrl: true}
    })

    if(!project?.githubUrl){
        throw new Error('Project does not have a github url');
    }
    return {project, githubUrl: project?.githubUrl};
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]){
    const processedCommits = await db.commit.findMany({
        where: { projectId},
    })

    //doing this to avoid duplicate commits
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash));

    return unprocessedCommits;
}

//await pollCommits('cm6cmkn0b0000nr3fwppy8uqj').then(console.log); //testing the function