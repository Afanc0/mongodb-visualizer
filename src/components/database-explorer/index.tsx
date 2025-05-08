import { Calendar, Home, Inbox, Search, Settings, Database, ChevronDown, ChevronRight, User2, ChevronUp } from "lucide-react"
import { 
    Sidebar,
    SidebarContent, 
    SidebarGroup, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarGroupLabel, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarMenu, 
    SidebarGroupContent, 
    SidebarProvider,
    SidebarMenuSub,
    SidebarMenuSubItem,
    
} from "../ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

export const DatabaseExplorer = () => {
    return (
        <SidebarProvider>
            <Sidebar variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Mongo Databases</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>

                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="group data-[state=open] flex items-center justify-between gap-2 w-full">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-4 h-4" color="gray" />
                                                    <span>admin</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">40.00KiB</span>
                                                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                                                </div>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <div className="flex flex-row">
                                                        <span>categories</span>
                                                    </div>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                                
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
        </Sidebar>
    </SidebarProvider>
    )
}