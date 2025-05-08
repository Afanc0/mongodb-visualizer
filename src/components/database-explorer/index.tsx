import { 
    Sidebar,
    SidebarContent, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarGroupContent, 
    SidebarProvider,
    
} from "../ui/sidebar"
import { MenuItem } from "../menu-item"

import { DatabaseInfo } from "/@/types/databases-info"

interface DatabaseExplorerProps {
    itemList: DatabaseInfo[]
}

export const DatabaseExplorer = ({
    itemList
}: DatabaseExplorerProps) => {
    return (
        <SidebarProvider>
            <Sidebar variant="floating" className="w-[325px]">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Mongo Databases</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemList.map((item) => (
                                    <MenuItem key={item.name} item={item} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}