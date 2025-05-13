import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserButton} from '@clerk/nextjs';
import {AppSidebar} from './app-sidebar';
//# this file is the layout for the sidebar
type Props = {
    children: React.ReactNode; //# this is the children of the layout
    //basically children is a react thing and by writing it there when i write in another file it will pass the data here hence rendering the children to out frontend 
};

const SidebarLayout = ({ children } : Props) => { //passing the children to the layout
return (
    <SidebarProvider>
        <AppSidebar /> {/* rendering the sidebar */}
        <main className="w-full m-2">

            {/* top bar */}
            <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
                <div className="ml-auto"></div>
                {/* <UserButton /> */}
                <UserButton 
                    afterSignOutUrl="/sign-in" // This will properly clear session and redirect
                />
            </div>

            <div className="h-4"></div> 
            {/* main content */}
            <div className="border-sidebar-border bf-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
                {children}

            </div>
        </main>
    </SidebarProvider>
    );
};

export default SidebarLayout;