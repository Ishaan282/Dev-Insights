//!making a question card 
'use client'
import MDEditor from "@uiw/react-md-editor"; //to format the file output 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project"
import React from 'react'
import { DialogTitle } from "@radix-ui/react-dialog";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";

const AskQuestionCard = () => {
    const {project} = useProject();
    const [open,setOpen] = React.useState(false);
    const [question, setQuestion] = React.useState('');
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{fileName: string; sourceCode: string; summary: string }[]>([])
    const[answer , setAnswer] = React.useState('')
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFilesReferences([])
        e.preventDefault();
        if(!project?.id) return 
        setLoading(true)
        

        const { output , filesReferences } = await askQuestion(question,project.id) //calling actions.ts funciton
        setOpen(true); //opening after i get ouput 
        setFilesReferences(filesReferences)

        for await(const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {/* <DialogTitle>
                                'Logo'
                            </DialogTitle> */}

                            {/* <Button variant={'outline'}>
                                Save answer
                            </Button> */}
                        </div>
                    </DialogHeader>

                    <MDEditor.Markdown source = {answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll"/>
                    <div className="h-4"></div>
                    <CodeReferences filesReferences={filesReferences}/>

                    <Button type="button" onClick={() => {setOpen(false)}}>
                        Close
                    </Button>
                </DialogContent>
            </Dialog>

            <Card className='relative col-span-3'>
                <CardHeader >
                    <CardTitle>
                        Ask a question
                    </CardTitle>
                    <CardContent>
                        <form onSubmit={onSubmit}>
                            <Textarea placeholder="ask me anything about the project!" value={question} onChange={(e) => setQuestion(e.target.value)}/>
                                <div className="h-4"></div>
                                <Button type = 'submit' disabled={loading}>
                                    Ask Ai
                                </Button>
                            
                        </form>
                    </CardContent>
                </CardHeader>
            </Card>
        </>
    )
}

export default AskQuestionCard