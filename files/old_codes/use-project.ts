// import { api } from '@/trpc/react'
// import React from 'react'
// import { useLocalStorage} from 'usehooks-ts'

// //function to get the project from the backend
// const useProject = () => {
//     const {data: projects} = api?.project?.getProjects?.useQuery() || {}
//     const [projectId , setProjectId] = useLocalStorage('devInsights_projectId', '') //storing in local state so it user closed the window and reopens it will continue from where it left
//     const project = projects?.find(project => project.id === projectId)
//     return {
//         projects,
//         project,
//         projectId,
//         setProjectId
//     } //calling the route to get projects
// }

// export default useProject
