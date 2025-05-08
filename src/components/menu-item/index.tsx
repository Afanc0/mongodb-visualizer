import { useState } from "react"
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "../ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronRight, Database } from "lucide-react"
import { invoke } from "@tauri-apps/api/core";

interface MenuItemProps {
    item: DatabaseInfo
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
}

interface DatabaseInfo {
    name: string
    size_on_disk: number
}

export const MenuItem = ({
    item,
    onGetCollectionFields
}: MenuItemProps) => {
    const [collections, setCollections] = useState<string[]>([])

    const getMongoCollections = async (dbName: string) => setCollections(await invoke("get_collections", { dbName }))

    return (
        <Collapsible className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild onClick={() => getMongoCollections(item.name)}>
                    <SidebarMenuButton className="group data-[state=open] flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" color="gray" />
                            <span>{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{(item.size_on_disk / 1024).toFixed(2)}KiB</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {collections.map((coll) => (
                            <SidebarMenuSubItem key={coll}>
                                <SidebarMenuSubButton onClick={() => onGetCollectionFields(item.name, coll)}>
                                    <div className="flex flex-row">
                                        <span>{coll}</span>
                                    </div>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}