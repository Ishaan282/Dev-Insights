'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar, SidebarMenu , SidebarContent, SidebarGroupContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { LayoutDashboard, Bot, Presentation, CreditCard , Plus} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import { Trash2 } from "lucide-react";

// //! this is the sidebar for the application
const items = [
{
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,},
{
    title: 'Q&A',
    url: '/qa',
    icon: Bot,},
{
    title: 'Meetings',
    url: '/meetings',
    icon: Presentation,},
// {
//     title: 'Billing',
//     icon: CreditCard,},
]

export function AppSidebar() {
    const pathname = usePathname()
    const {open} = useSidebar()
    const [showArchived, setShowArchived] = useState(false); // State for toggle
    const {projects, projectId, setProjectId, archivedProjects} = useProject(showArchived);
    const router = useRouter();

    useEffect(() => {
        // Check if there are no projects and the user is not on the /create route
        if (projects && projects.length === 0 && pathname !== '/create') {
            router.push('/create'); //# Redirect to /create
        }
    }, [projects, pathname, router]);

    return (
        //! logo
    <Sidebar collapsible="icon" variant="floating" > {/*transition duration*/}
        <SidebarHeader>
            <div className="flex items-center gap-2">
                {open && (
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        DevInsights
                    </h1>
                )}

            </div>
        </SidebarHeader>

    
        <SidebarContent >
        {/* first sidebar group */}
        <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                        <Link href={item.url} className={cn(
                            pathname === item.url ? '!bg-primary !text-white' : ''
                            )}>
                            <item.icon />
                            <span>{item.title}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>

            </SidebarGroupContent>
        </SidebarGroup>

        {/* second sidebar group */}
        <SidebarGroup>
            <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
            <SidebarGroupContent>
                {/*$ rendering the projects from backend  */}
                <SidebarMenu>
                <div className="flex justify-center">
                <Button 
                    size="sm" 
                    variant={showArchived ? 'default' : 'outline'}
                    className={cn(
                        "w-fit transition-colors",
                        showArchived ? 'bg-green-500 hover:bg-green-600' : ''
                    )}
                    onClick={() => setShowArchived(!showArchived)}
                    >
                    {showArchived ? (
                        <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hide Archived
                        </>
                    ) : (
                        "View Archived Projects"
                    )}
                </Button>
                </div>

                    {(showArchived ? archivedProjects : projects)?.map(project => (
                        <SidebarMenuItem key={`${project.id}-${showArchived}`}>
                        <SidebarMenuButton asChild>
                            <div onClick={() => setProjectId(project.id)}>
                            <div className={cn(
                                "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary w-5 h-5 min-w-5 min-h-5",
                                {
                                'bg-black border-primary text-white': project.id === projectId,
                                'opacity-70': showArchived
                                }
                            )}>
                                {project.name.charAt(0)} 
                            </div>
                            <span className={cn({
                                'line-through': showArchived
                            })}>
                                {project.name}
                            </span>
                            </div>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <div className="h-2"></div>
                    
                {open && (
                    <SidebarMenuItem>
                        <Link href='/create'>
                            <Button size='sm' variant={'outline'} className="w-fit"> 
                                <Plus />
                                Create Project 
                            </Button>
                        </Link>
                    </SidebarMenuItem>
                )}


                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>
    </Sidebar>
    )
}

