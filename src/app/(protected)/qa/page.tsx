'use client'
import { api } from '@/trpc/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useProject from '@/hooks/use-project';

import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from '../dashboard/code-references';

const QApage = () => {
    const {projectId} = useProject();
    const {data: questions} = api.project.getQuestions.useQuery({ projectId});

    const [questionIndex , setQuestionIndex] = React.useState(0)
    const question = questions?.[questionIndex]

    return (
        <Sheet>
            <AskQuestionCard />
            <div className="h-4"></div>
            <h1 className="text-xl font-semibold">Saved Questions</h1>
            <div className="h-4"></div>
            <div className="flex flex-col gap-2">
                {questions?.map((question,index) => {
                    return <React.Fragment key={question.id}>
                        {/* sheettrigger is a button that opens the sheet */}
                        <SheetTrigger onClick={() => setQuestionIndex(index)}> 
                            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                                <img className="rounded-full h-10 w-10" src={question.user.imageUrl ?? ""} />

                                <div className='text-left flex flex-col'>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                                            {question.question}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {question.createdAt.toDateString()}
                                        </span>
                                    </div>
                                    {/* line-clamp means that the text will be clipped if it is too long */}
                                    <q className="text-gray-500 line-clamp-1 text-sm">
                                        {question.answer}
                                    </q>
                                </div>
                            </div>
                        </SheetTrigger>
                    </React.Fragment>
                })}
            </div>

            {question && (
                <SheetContent className='sm:max-w-[80vw] overflow-y-auto'>
                    <SheetHeader>
                        <SheetTitle>
                            {question.question}
                        </SheetTitle>
                        <MDEditor.Markdown source={question.answer} />
                        <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
                    </SheetHeader>
                </SheetContent>
            )} 
            {/* 3:09 */}
        </Sheet>
    )
}

export default QApage