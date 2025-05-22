import { useState } from "react"
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "../ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronRight, Database, Plus, Trash } from "lucide-react"
import { invoke } from "@tauri-apps/api/core";
import { DatabaseInfo } from "/@/types/databases-info"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface MenuItemProps {
    item: DatabaseInfo
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
    onHandleSelectedCollection: (dbName: string, collName: string) => void
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
}

export const MenuItem = ({
    item,
    onGetCollectionFields,
    onHandleSelectedCollection,
    onFetchRecords
}: MenuItemProps) => {
    const [collections, setCollections] = useState<string[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [collectionName, setCollectionName] = useState("");

    const getMongoCollections = async (dbName: string) => {
        setCollections(await invoke("get_collections", { dbName }))
    }

    const handleLoadCollection = async (dbName: string, collName: string) => {
        await onGetCollectionFields(dbName, collName)
        await onFetchRecords(dbName, {}, collName)
        onHandleSelectedCollection(dbName, collName)
    }

    const createCollection = async () => {
        if (collectionName.length !== 0) {
            await invoke('create_collection', { dbName: item.name, collName: collectionName })
            await getMongoCollections(item.name)
            setCollectionName("")
        }
        setIsDialogOpen(false)
    }

    const handleDeleteCollection = async (collName: string) => {
        await invoke('drop_collection', { dbName: item.name, collName })
        await getMongoCollections(item.name)
    }

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
                                <SidebarMenuSubButton onClick={() => handleLoadCollection(item.name, coll)}>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <span>{coll}</span>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="bg-transparent border-0 cursor-pointer hover:bg-transparent w-auto"
                                            onClick={() => handleDeleteCollection(coll)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <SidebarMenuSubButton className="flex justify-center">
                                        <Plus className="h-4 w-4 mr-2" />
                                    </SidebarMenuSubButton>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Collection</DialogTitle>
                                        <DialogDescription>Define a collection to add to your database.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="fieldName" className="text-right">
                                                Title
                                            </Label>
                                            <Input
                                                id="fieldName"
                                                name="name"
                                                value={collectionName}
                                                onChange={e => setCollectionName(e.target.value)}
                                                placeholder="e.g. name"
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="button" onClick={createCollection}>
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}