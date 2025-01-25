'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react' //importing api from trpc
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
    const createProject = api.project.createProject.useMutation()
    const refetch = useRefetch() 
    //.project came from root.ts

    function onSubmit(data: FormInput) {
        // window.alert(JSON.stringify(data,null,2)); //this will show an alert windows on submit
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
        return true;
    }
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
                        <div className="h-4"></div>
                        <Button type='submit' disabled={createProject.isPending}>
                            Create Project
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CreatePage