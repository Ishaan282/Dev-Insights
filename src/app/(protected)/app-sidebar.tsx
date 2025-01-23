'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarMenu , SidebarContent, SidebarGroupContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { LayoutDashboard, Bot, Presentation, CreditCard , Plus} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Q&A',
    url: '/qa',
    icon: Bot,
  },
  {
    title: 'Meetings',
    url: '/meetings',
    icon: Presentation,
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard,
  },
]

const projects = [
    {
        name: 'Project 1',
    },
    {
        name: 'Project 2',
    },
    {
        name: 'Project 3',
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const {open} = useSidebar()
    return (
    <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                {open && (
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        DevInsights
                    </h1>
                )}

            </div>
        </SidebarHeader>

        <SidebarContent>
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
                <SidebarMenu>
                    {projects.map(project => {
                        return (
                            <SidebarMenuItem key={project.name}>
                                <SidebarMenuButton asChild>
                                    <div>
                                        <div className={cn(
                                            "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                                            {
                                                'bg-black border-primary text-white': true
                                                // "bg-primary text-white" : project.id === project.id 
                                            }
                                        )}>
                                            {project.name.charAt(0)}
                                        </div>
                                        <span>{project.name}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
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