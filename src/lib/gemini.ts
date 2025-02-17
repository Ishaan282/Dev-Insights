import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from '@langchain/core/documents'

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

export const aisummariseCommit = async (diff: string) => {
    // https://github.com/<owner>/<repo>/commit/<commitHash>.diff
    const response = await model.generateContent([
        `
        You are an expert programmer tasked with summarizing a git diff file.
        ### Key Points to Remember:
        1. A git diff format includes metadata and line changes for modified files.
            Example metadata:
            \`\`\`
            diff --git a/file/path b/file/path
            index <hash>..<hash> <file permissions>
            --- a/file/path
            +++ b/file/path
            \`\`\`
        2. Line changes:
           - Lines starting with \`+\` were **added**.
           - Lines starting with \`-\` were **deleted**.
           - Lines starting with neither \`+\` nor \`-\` are for **context**.
        3. Summaries should:
            - Be concise but specific.
            - Include file names or general descriptions of the changes.
            - Avoid overly broad descriptions like "Updated code."

        ### Example Summaries:
        - Increased the max retry attempts to 5 [lib/retry.js].
        - Fixed an off-by-one error in array indexing [src/utils/arrayHelpers.ts].
        - Improved logging for HTTP requests [server/httpLogger.js], [server/config.js].
        - Refactored error handling logic across several files.

        DO NOT include this instruction in your output. Focus only on summarizing the following git diff:
        \n\n${diff}`,
    ]);

    return response.response.text();
}

//#testing function to get ai response
// console.log(await aisummariseCommit(
//     `
//     diff --git a/Samiksha/decision_Tree.ipynb b/Samiksha/decision_Tree.py
// similarity index 100%
// rename from Samiksha/decision_Tree.ipynb
// rename to Samiksha/decision_Tree.py
//     `
// ));


//!funciton to pass the code to ai
export async function summariseCode(doc: Document){
    console.log("getting summary for", doc.metadata.source);
    try {
        const code = doc.pageContent.slice(0, 10000); //limit the file to 10k characters
        const response = await model.generateContent([
            `
            You are a senior software engineer specializing in onboarding junior developers.  
            Your task is to help a junior engineer understand the purpose and functionality of the file: "${doc.metadata.source}".  
    
            Below is the code from the file:  
            ---  
            ${code}  
            ---  
    
            **Task:**  
            Summarize the purpose and functionality of this file in simple, clear terms.  
            Your summary should:  
            1. Explain the file's role in the project.  
            2. Highlight its key functions or components.  
            3. Mention any important dependencies (if applicable).  
            4. Keep it concise (preferably under 150 words, but expand slightly if necessary for clarity).   
    
            Provide a clear, structured response.
            `
        ]);
    
        return response.response.text();

    } catch(error){
        return ''
    }



}

//!generating embaddings 
//we generate the embedding of files using ai so when someone asks a question gemini wil look into embaddings 
export async function generateEmbedding(summary: string){
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })
    const result = await model.embedContent(summary) //generating summary embeddings
    const embedding = result.embedding
    return embedding.values
}

//console.log(await generateEmbedding("hello world")); //#testing the function 