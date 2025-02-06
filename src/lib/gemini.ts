import { GoogleGenerativeAI } from "@google/generative-ai";

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

//testing
// console.log(await aisummariseCommit(
//     `
//     diff --git a/Samiksha/decision_Tree.ipynb b/Samiksha/decision_Tree.py
// similarity index 100%
// rename from Samiksha/decision_Tree.ipynb
// rename to Samiksha/decision_Tree.py
//     `
// ));
//run this file and you will the response from ai 