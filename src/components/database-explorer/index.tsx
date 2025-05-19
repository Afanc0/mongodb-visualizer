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
    onHandleSelectedCollection: (dbName: string, collName: string) => void
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
}

export const DatabaseExplorer = ({
    itemList,
    onGetCollectionFields,
    onFetchRecords,
    onHandleSelectedCollection
}: DatabaseExplorerProps) => {
    return (
        <SidebarProvider>
            <Sidebar className="w-auto min-w-3xs relative">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Mongo Databases</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemList.map((item) => (
                                    <MenuItem 
                                        key={item.name} 
                                        item={item} 
                                        onGetCollectionFields={onGetCollectionFields}
                                        onHandleSelectedCollection={onHandleSelectedCollection}
                                        onFetchRecords={onFetchRecords}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}