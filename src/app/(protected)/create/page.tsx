'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react' //importing api from trpc
import { Info } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const {register , handleSubmit , reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation() //an variable to call the route
    const checkCredits = api.project.checkCredits.useMutation()

    const refetch = useRefetch() //this will refresh the window to load new data
    //.project came from root.ts

    function onSubmit(data: FormInput) {
        // window.alert(JSON.stringify(data,null,2)); //this will show an alert windows on submit
        if(!!checkCredits.data){ //if checkCredits.data is true
            createProject.mutateAsync({
                githubUrl: data.repoUrl,
                name: data.projectName,
                githubToken: data.githubToken
            }, {

                onSuccess: () => {
                    toast.success('Project created successfully')
                    refetch() //this will refresh the window to load new data
                    reset()
                },
                onError: (error) => {
                    toast.error('Failed to create project')
                }
            })
        } else{ //if no checkCredits.data
            checkCredits.mutate({
                githubUrl: data.repoUrl,
                githubToken: data.githubToken
            })
        }
    }

    const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true

return (
    <div className="flex items-center gap-12 h-full justify-center">
        <img src="/undraw_github.svg" alt="" className='h-56 w-auto'/>
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your GitHub Repository
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Enter the URL of your repository to link it to DevInsights
                </p>
            </div>
            <div className="h-4">
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            {...register('projectName' , {required:true}) }
                            placeholder='Project Name'
                            required
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register('repoUrl' , {required:true}) }
                            placeholder='Github URL'
                            type='url'
                            required
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register('githubToken') }
                            placeholder='Github Token (Optional)'
                        />

                        {!!checkCredits.data && (
                            <>
                                <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                                    <div className="flex items-center gap-2">
                                        <Info className='size-4' />
                                        <p className="text-sm">You will be charged <strong>{checkCredits.data?.fileCount}</strong> credits for the repository</p>
                                    </div>
                                    <p className="text-sm text-blue-600 ml-6">You have <strong>{checkCredits.data?.userCredits}</strong> credits remaining.</p>
                                </div>
                            </>
                        )}

                        <div className="h-4"></div>
                        <Button type='submit' disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}>
                            {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
                            {/* Create Project */}
                        </Button>  {/* passing the data to createProject */}
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CreatePage