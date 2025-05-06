'use server'
//! this file is to pass files to ai 
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini';
import { db } from '@/server/db';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string){
    const stream = createStreamableValue()
    //making question in vector 
    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(',')}]`

    const result = await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary", 
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC
        LIMIT 10
    ` as { fileName: string; sourceCode: string; summary: string }[];
    // Getting similar embeddings

    let context = ''
    for(const doc of result){
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    } //appending all the similar embeddings to a variable

    (async () => {
        const { textStream } = await streamText({
            model: google('gemini-2.0-flash'),
            prompt: `
                You are an AI code assistant that helps technical interns understand and navigate a codebase. Your responses should be friendly, knowledgeable, and detailed. Use markdown syntax and include code snippets when applicable.

                START CONTEXT BLOCK
                ${context}
                END CONTEXT BLOCK

                START QUESTION
                ${question}
                END QUESTION

                - Prioritize information from the context block when answering.
                - If the question is about code, provide detailed explanations, including step-by-step instructions and code snippets.
                - If the context does not provide enough information, say, "I'm sorry, but I don't know the answer to that question."
                - If new information is provided, update your response without apologizing for previous answers.
                - Do not invent information that is not supported by the context or general knowledge.
                `,
        });

        for await(const delta of textStream){
            stream.update(delta)
        }

        stream.done()
    })()

    return {
        output: stream.value, //the gemini output
        filesReferences: result //references
    }
}