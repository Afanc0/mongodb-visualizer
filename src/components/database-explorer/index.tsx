import { 
    Sidebar,
    SidebarContent, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarGroupContent, 
    SidebarProvider,
    SidebarFooter,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSubButton,
    
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
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"

interface DatabaseExplorerProps {
    itemList: DatabaseInfo[]
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
    onHandleSelectedCollection: (dbName: string, collName: string) => void
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
    onGetDatabase: () =>  Promise<void>
}

export const DatabaseExplorer = ({
    itemList,
    onGetCollectionFields,
    onFetchRecords,
    onHandleSelectedCollection,
    onGetDatabase
}: DatabaseExplorerProps) => {

    const [connectionString, setConnectionString] = useState("")
    const [stringDraft, setStringDraft] = useState("")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [collectionName, setCollectionName] = useState("");
    const [databaseName, setDatabaseName] = useState("");

    const handleConnection = async () => {
        await invoke('set_connection_string', { connectionString })
        setStringDraft(connectionString)
    }

    const handleCancel = () => {
        setConnectionString(stringDraft)
    }

    const createDatabasse = async () => {
        if (collectionName.length !== 0) {
            await invoke('create_collection', { dbName: databaseName, collName: collectionName })
            await onGetDatabase()
            setCollectionName("")
            setDatabaseName("")
        }
        setIsDialogOpen(false)
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
                                {itemList.length > 0 && (
                                    <SidebarMenuItem>
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <SidebarMenuSubButton className="flex justify-center">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                </SidebarMenuSubButton>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create Database</DialogTitle>
                                                    <DialogDescription>Define a database and collection to add to your service.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="fieldDb" className="text-right">
                                                            Database
                                                        </Label>
                                                        <Input
                                                            id="fieldDb"
                                                            name="database"
                                                            value={databaseName}
                                                            onChange={e => setDatabaseName(e.target.value)}
                                                            placeholder="e.g. database name"
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="fieldColl" className="text-right">
                                                            Collection
                                                        </Label>
                                                        <Input
                                                            id="fieldColl"
                                                            name="collection"
                                                            value={collectionName}
                                                            onChange={e => setCollectionName(e.target.value)}
                                                            placeholder="e.g. collection name"
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="button" onClick={createDatabasse}>
                                                        Create
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </SidebarMenuItem>
                                )}
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