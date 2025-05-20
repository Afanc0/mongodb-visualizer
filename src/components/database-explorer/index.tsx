import { 
    Sidebar,
    SidebarContent, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarGroupContent, 
    SidebarProvider,
    SidebarFooter,
    
} from "../ui/sidebar"
import { MenuItem } from "../menu-item"

import { DatabaseInfo } from "/@/types/databases-info"
import { Button } from "../ui/button"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "../ui/alert-dialog"
import { Input } from "../ui/input"
import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"

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

    const [connectionString, setConnectionString] = useState("")
    const [stringDraft, setStringDraft] = useState("")

    const handleConnection = async () => {
        await invoke('set_connection_string', { connectionString })
        setStringDraft(connectionString)
    }

    const handleCancel = () => {
        setConnectionString(stringDraft)
    }

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
                <SidebarFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <span>Link Account</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Connect to Your MongoDB Database</AlertDialogTitle>
                                <AlertDialogDescription>Please enter your MongoDB connection string. You can find it by using <code>mongosh</code>.</AlertDialogDescription>
                                <Input 
                                    type="text" 
                                    value={connectionString}
                                    placeholder="e.g. mongodb+srv://user:password@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority" 
                                    onChange={e => setConnectionString(e.target.value)}
                                />
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConnection}>Connect</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SidebarFooter>
            </Sidebar>
        </SidebarProvider>
    )
}