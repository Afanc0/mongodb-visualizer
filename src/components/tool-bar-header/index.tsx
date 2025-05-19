import { Trash } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useCallback, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Collection } from "/@/types/databases-info"
import { toast } from "sonner"
import { stringToJson } from "/@/utils/string-to-json"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"

interface ToolBarHeaderProps {
    data: any[],
    selectedCollection: Collection
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
    onClearRowSelection: () => void
}

export const ToolBarHeader = ({
    data,
    selectedCollection,
    onFetchRecords,
    onClearRowSelection,
    onGetCollectionFields
}: ToolBarHeaderProps) => {
    const [filter, setFilter] = useState({})

    const onDeleteSelected = useCallback(async () => {
        const objectIdFilter = data.map(value => value["_id"]["$oid"])
        await invoke("bulk_delete", {
            db: selectedCollection.db,
            coll: selectedCollection.coll,
            docJson: JSON.stringify(objectIdFilter)
        })
        
        await onFetchRecords(selectedCollection.db, {}, selectedCollection.coll)
        await onGetCollectionFields(selectedCollection.db, selectedCollection.coll)
        onClearRowSelection()
        toast("Records deleted", {
            description: "The selected records have been successfully removed.",
        })
    }, [data])

    const handleFilter = async (e: React.FormEvent) => {
        e.preventDefault()
        const jsonFilter = stringToJson(filter as string)
        await onFetchRecords(selectedCollection.db, jsonFilter, selectedCollection.coll)
    }

    return (
        <div className="py-3 px-2 flex justify-between">
            <div className="flex-1">
                <form onSubmit={handleFilter}>
                    <Input type="text" placeholder="e.g., name='Car'; model='Toyota'"  onChange={e => setFilter(e.target.value)}/>
                </form>
            </div>
            <div className="flex gap-3 flex-1 justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Trash />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This can't be undone. This will permanently delete your record(s).
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeleteSelected}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
