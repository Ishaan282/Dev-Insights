'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import React from 'react'
import { useDropzone } from 'react-dropzone'
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar' //it's used to show the progress of the upload
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation' //this is used to navigate to another page
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

const MeetingCard = () => {
    const { project } = useProject();
    const processMeeting = useMutation({ mutationFn: async (data: {meetingUrl : string, meetingId: string, projectId: string}) => {
        const {meetingUrl, meetingId, projectId} = data
        const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId });
        return response.data
    }})

    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const router = useRouter()
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const {getRootProps , getInputProps} =  useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav' , '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000, //50mb
        onDrop: async acceptedFiles => {
            if (!project) return
            setIsUploading(true) //updating the state
            // console.log(acceptedFiles);
            const file = acceptedFiles[0]
            if(!file) return
            const downloadURL = await uploadFile(file as File,setProgress) as string //as File because we are passing a file to firebase
            uploadMeeting.mutate({
                projectId: project.id,
                meetingUrl: downloadURL,
                name: file.name
            }, {
                onSuccess: (meeting) => {
                    toast.success("Meeting uploaded successfully")
                    router.push('/meetings')
                    processMeeting.mutate({meetingUrl: downloadURL, meetingId: meeting.id, projectId: project.id})
                },
                onError: () => {
                    toast.error("Failed to upload meeting")
                }
            })
            // window.alert(downloadURL)
            setIsUploading(false)
        }
    }) //getting audio file input

    return (
        <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()}>
            {/* if not uploading */}
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
            {/* if uploading */}
            {isUploading && (
                <div className='flex items-center justify-center'>
                {/* <div> */}
                    <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
                        buildStyles({
                            pathColor: '#10B981', // Green color for the progress bar
                            textColor: '#10B981', // Green color for the text
                            trailColor: '#D1FAE5', // Light green color for the trail
                        })
                    }/>
                    <p className="text-sm text-gray-500 text-center">Uploading your meeting...</p>
                </div>
            )}

            
        </Card>
    )
}

export default MeetingCard