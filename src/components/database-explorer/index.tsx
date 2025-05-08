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
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
}

export const DatabaseExplorer = ({
    itemList,
    onGetCollectionFields
}: DatabaseExplorerProps) => {
    return (
        <SidebarProvider>
            <Sidebar className="w-auto">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Mongo Databases</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemList.map((item) => (
                                    <MenuItem key={item.name} item={item} onGetCollectionFields={onGetCollectionFields} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}