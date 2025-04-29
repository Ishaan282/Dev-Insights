// 'use client'
// import { Button } from '@/components/ui/button'
// import useProject from '@/hooks/use-project'
// import useRefetch from '@/hooks/use-refetch'
// import { api } from '@/trpc/react'
// import React from 'react'
// import { toast } from 'sonner'

// const ArchiveButton = () => {
//     const archiveProject = api.project.archiveProject.useMutation()
//     const {projectId} = useProject();
//     const refetch = useRefetch();
//     return (
//         <Button disabled={archiveProject.isPending} size='sm' variant='destructive'  onClick={() => {
//             const confirm = window.confirm("are you sure you want to archive this project?")
//             if(confirm) archiveProject.mutate({projectId} , {
//                 onSuccess: () => {
//                     toast.success("project archived!")
//                     refetch()
//                 },
//                 onError: () => {
//                     toast.error("failed to archive project")

//                 }
//             })
//         }}>
//             Archive
//         </Button>
//     )
// }

// export default ArchiveButton





'use client'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner'

const ArchiveButton = () => {
    const archiveProject = api.project.archiveProject.useMutation()
    const unArchiveProject = api.project.unArchiveProject.useMutation()
    const { project, projectId } = useProject()
    const refetch = useRefetch()
    
    let isArchived = false;
    if(project?.deletedAt !== null) isArchived = true

    const handleArchive = () => {
        const confirm = window.confirm(
            isArchived 
                ? "Are you sure you want to unarchive this project?" 
                : "Are you sure you want to archive this project?"
        )
        
        if (!confirm) return

        const mutation = isArchived ? unArchiveProject : archiveProject
        const successMessage = isArchived ? "Project unarchived!" : "Project archived!"
        const errorMessage = isArchived ? "Failed to unarchive project" : "Failed to archive project"

        mutation.mutate({ projectId }, {
            onSuccess: () => {
                toast.success(successMessage)
                refetch()
            },
            onError: () => {
                toast.error(errorMessage)
            }
        })
    }

    return (
        <Button 
            disabled={archiveProject.isPending || unArchiveProject.isPending} 
            size='sm' 
            variant={isArchived ? 'default' : 'destructive'}  
            onClick={handleArchive}
        >
            {isArchived ? 'Unarchive' : 'Archive'}
        </Button>
    )
}

export default ArchiveButton
