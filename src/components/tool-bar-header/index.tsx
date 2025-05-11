import { Edit, Plus, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Collection } from "/@/types/databases-info"
import { toast } from "sonner"

interface ToolBarHeaderProps {
    data: any[],
    selectedCollection: Collection
    onFetchRecords: () => Promise<void>
    onClearRowSelection: () => void
}

export const ToolBarHeader = ({
    data,
    selectedCollection,
    onFetchRecords,
    onClearRowSelection
}: ToolBarHeaderProps) => {
    const onDeleteSelected = useCallback(async () => {
        const objectIdFilter = data.map(value => value["_id"]["$oid"])
        await invoke("bulk_delete", {
            db: selectedCollection.db,
            coll: selectedCollection.coll,
            docJson: JSON.stringify(objectIdFilter)
        })
        
        await onFetchRecords()
        onClearRowSelection()
        toast("Records deleted", {
            description: "The selected records have been successfully removed.",
        })
    }, [data])

    return (
        <div className="p-3 flex justify-between">
            <div className="flex-1 px-3">
                <Input type="text" placeholder="e.g., name='Car'; model='Toyota'" />
            </div>
            <div className="flex gap-3 flex-1 justify-end">
                <Button variant="outline" size="icon">
                    <Edit />
                </Button>
                <Button variant="outline" size="icon" onClick={onDeleteSelected}>
                    <Trash />
                </Button>
                <Button variant="outline" size="icon">
                    <Plus />
                </Button>
            </div>
        </div>
    )
}
