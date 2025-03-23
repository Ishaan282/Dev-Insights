'use client'
//this file will show team member profiles 
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembres = () => {
    const {projectId} = useProject()
    const { data: teamMembers } = api.project.getTeamMembers.useQuery({ projectId })
    return (
        <div className="flex items-center gap-2">
            {teamMembers?.map(member => (
                <img key={member.id} src={member.user.imageUrl || ''} alt={member.user.firstName || ''} className='rounded-full h-8 w-8'></img>
            ))} 
        </div>
    )
}

export default TeamMembres