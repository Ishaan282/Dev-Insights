// 'use client'

// import { Button } from '@/components/ui/button'
// import useProject from '@/hooks/use-project'
// import useRefetch from '@/hooks/use-refetch'
// import { api } from '@/trpc/react'
// import React from 'react'
// import { toast } from 'sonner'

// const DeleteButton = () => {
//     const deleteProject = api.project.deleteProject.useMutation()
//     const { projectId } = useProject()
//     const refetch = useRefetch()

//     return (
//         <Button
//             disabled={deleteProject.isPending}
//             size="sm"
//             variant="destructive"
//             onClick={() => {
//                 const confirm = window.confirm("Are you sure you want to delete this project? This action cannot be undone.")
//                 if (confirm) {
//                     deleteProject.mutate(
//                         { projectId },
//                         {
//                             onSuccess: () => {
//                                 toast.success("Project deleted successfully!")
//                                 refetch()
//                             },
//                             onError: (error) => {
//                                 toast.error(`Failed to delete project: ${error.message}`)
//                             },
//                         }
//                     )
//                 }
//             }}
//         >
//             Delete
//         </Button>
//     )
// }

// export default DeleteButton