'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'

const MeetingCard = () => {
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const {getRootProps , getInputProps} =  useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav' , '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000, //50mb
        onDrop: async acceptedFiles => {
            setIsUploading(true) //updating the state
            console.log(acceptedFiles);
            const file = acceptedFiles[0]
            const downloadURL = await uploadFile(file as File,setProgress) //as File because we are passing a file to firebase
            setIsUploading(false)
        }
    }) //getting audio file input

    return (
        <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()}>
            {!isUploading && ( 
                // if nothing is uploading then show this 
                <>
                    <Presentation className = "h-10 w-10 animate-bounce" />
                    <h3 className="ht-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with ourTool.
                        <br />
                        Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading} >
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true"/>
                            Upload Meeting
                            <input className="hidden" {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
        </Card>
    )
}

export default MeetingCard