//!added archived projects
import { api } from '@/trpc/react'
import React, { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useProject = (showArchived: boolean = false) => {
    // Active projects
    const { data: projects } = api.project.getProjects.useQuery() || {}
    
    // Archived projects (only fetched when needed)
    const { data: archivedProjects, refetch: refetchArchivedProjects } = api.project.getArchiveProjects.useQuery(undefined, {
        enabled: showArchived // Enable query based on showArchived state
    })
    
    const [projectId, setProjectId] = useLocalStorage('devInsights_projectId', '')
    const project = projects?.find(project => project.id === projectId)

    useEffect(() => {
        if (showArchived) {
            refetchArchivedProjects()
        }
    }, [showArchived, refetchArchivedProjects])

    return {
        projects,
        archivedProjects,
        project,
        projectId,
        setProjectId
    }
}

export default useProject