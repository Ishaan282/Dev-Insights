'use client' //this makes it client side compatible
import React from 'react'
import { useUser} from '@clerk/nextjs'
import { SidebarHeader } from '@/components/ui/sidebar'
const DashboardPage = () => {
    const {user} = useUser()
    return (
        <div>
            <div>{user?.firstName}</div>
            <div>{user?.lastName}</div>
        </div>
    )
}

export default DashboardPage