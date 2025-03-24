
//!old code 
// export function AppSidebar() {
//     const pathname = usePathname()
//     const {open} = useSidebar()
//     // const {projects, projectId , setProjectId} = useProject();
//     const {projects, projectId, setProjectId, archivedProjects} = useProject();
//     const router = useRouter();

//     const [showArchived, setShowArchived] = useState(false); // State for toggle

//     useEffect(() => {
//         // Check if there are no projects and the user is not on the /create route
//         if (projects && projects.length === 0 && pathname !== '/create') {
//             router.push('/create'); //# Redirect to /create
//         }
//     }, [projects, pathname, router]);

//     return (
// ! <same here>


//# new start

//         {/* second sidebar group */}
//         <SidebarGroup>
//             <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
//             <SidebarGroupContent>
//                 {/*$ rendering the projects from backend  */}
//                 <SidebarMenu>
//                 <div className="flex justify-center">
//                     <Button size="sm" variant={'outline'} className="w-fit">
//                         view archived project
//                     </Button>
//                 </div>
//                     {projects?.map(project => {
//                         return (
//                             <SidebarMenuItem key={project.name}>
//                                 <SidebarMenuButton asChild>
//                                     <div onClick = {() => {
//                                         setProjectId(project.id)
//                                     }}>
//                                         <div className={cn(
//                                             "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary w-5 h-5 min-w-5 min-h-5",
//                                             {
//                                                 'bg-black border-primary text-white' : project.id === projectId  //if the project.id is selected then show the selected project
//                                             }
//                                         )}>
//                                             {project.name.charAt(0)} 
//                                         </div>
//                                         <span>{project.name}</span>

//                                     </div>
//                                 </SidebarMenuButton>
//                             </SidebarMenuItem>
//                         )
//                     })}
//                     <div className="h-2"></div>