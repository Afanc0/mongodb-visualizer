import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "/@/components/ui/checkbox"
import { Input } from "../../ui/input";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Check, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Collection } from "/@/types/databases-info";

export function generateColumns<T extends object>(fields: string[], selectedCollection: Collection): ColumnDef<T>[] {
    const selectionColumn: ColumnDef<T> = {
        id: "select",
        header: ({ table }) => (
            <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    }

    const fieldColumns: ColumnDef<T>[] = fields.map((field) => ({
        accessorKey: field,
        header: field.charAt(0).toUpperCase() + field.slice(1),
        cell: ({ row, getValue }) => {
            const value = getValue()
            const [editingValue, setEditingValue] = useState(value)
            const [isEditing, setIsEditing] = useState(false)

            const id = (row.original as any)._id?.$oid;

            const isReadOnly =
                field === "_id" ||
                (typeof value === "object" && value !== null);

            if (isReadOnly) {
                if (field === "_id") {
                    return (
                        <span className="text-muted-foreground text-sm whitespace-pre-wrap">
                            {(value as { $oid: string })["$oid"]}
                        </span>
                    )
                }
                return (
                    <span className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                    </span>
                )
            }

            /* Update by object id not working */
            const handleSave = async (field: string, editingValue: any, _id: string) => {
                console.log(field, editingValue, _id)
                await invoke('update_one', {
                    db: selectedCollection.db,
                    coll: selectedCollection.coll,
                    filter: JSON.stringify({ "_id": _id }),
                    update: JSON.stringify({ "$set": { [field]: editingValue } })
                })
                setIsEditing(false)
            }

            const handleCancel = () => setIsEditing(false)

            return (
                isEditing ? (
                    <div className="flex items-center gap-1">
                        <Input
                            value={editingValue as any}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => {
                                handleSave(field, editingValue, id);
                                setIsEditing(false)
                            }}
                            autoFocus
                            className="h-auto w-1/2"
                        />
                        <div className="flex gap-1">
                            {/* Both buttons do not work, onBlur does */}
                            {/* <Button size="icon" variant="ghost" className="h-7 w-7">
                                <Check className="h-4 w-4" />
                            </Button> */}
                            {/* <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                            </Button> */}
                        </div>
                    </div>
                ) : (
                    <span onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
                        {editingValue as any}
                    </span>
                )
            )
        }}
    ))

  return [selectionColumn, ...fieldColumns]
}