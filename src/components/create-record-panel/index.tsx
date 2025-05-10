import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GripVertical, X, PlusCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { cn } from "/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { invoke } from "@tauri-apps/api/core"
import { Collection } from "/@/types/databases-info"
import { toast } from "sonner"

interface CreateRecordPanelProps {
    fieldList: string[]
    selectedCollection: Collection
}

export const CreateRecordPanel = ({
    fieldList,
    selectedCollection
}: CreateRecordPanelProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([])
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    const [availableFields, setAvailableFields] = useState<string[]>(fieldList)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [newField, setNewField] = useState("")

    useEffect(() => {
        setAvailableFields(fieldList)
    }, [fieldList])

    const handleDragStart = (e: React.DragEvent, field: string) => {
        e.dataTransfer.setData("fieldId", field)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (dropZoneRef.current) {
            dropZoneRef.current.classList.add("bg-gray-100")
        }
    }

    const handleDragLeave = () => {
        if (dropZoneRef.current) {
            dropZoneRef.current.classList.remove("bg-gray-100")
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()

        if (dropZoneRef.current) {
            dropZoneRef.current.classList.remove("bg-gray-100")  
        }

        const fieldId = e.dataTransfer.getData("fieldId")
        const field = availableFields.find((f) => f === fieldId)

        if (field && !selectedFields.some((f) => f === fieldId)) {
            setSelectedFields([...selectedFields, field])
        }
    }

    const handleRemoveField = (fieldId: string) => {
        setSelectedFields(selectedFields.filter((field) => field !== fieldId))
        const newFormValues = { ...formValues }
        delete newFormValues[fieldId]
        setFormValues(newFormValues)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value,
        })

        if (isSubmitted) {
            setIsSubmitted(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Form submitted with data:", formValues)
        setIsSubmitted(true)
        
        await invoke("insert_one", {
            db: selectedCollection.db,
            coll: selectedCollection.coll,
            docJson:  JSON.stringify(formValues)
        })

        toast("Entry created", {
            description: "A new record has been successfully added.",
        })

        setFormValues({})
    }

    const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewField(e.target.value)
    }
    
    const handleCreateField = () => {
        setAvailableFields([...availableFields, newField])
        setNewField("")
        setIsDialogOpen(false)
    }

  return (
    <div className="flex flex-row w-full h-full">
        <Card className="flex-1 rounded-none border-r border-l-0 border-y-0">
            <CardHeader>
                <CardTitle>Available Fields</CardTitle>
                <span className="text-sm text-muted-foreground mb-4">
                    Drag fields to the form area on the right to add them to your form.
                </span>
            </CardHeader>
            <CardContent className="space-y-3 h-full overflow-y-auto pr-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mb-4">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create New Field
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Field</DialogTitle>
                            <DialogDescription>Define a custom field to add to your form.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fieldName" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="fieldName"
                                    name="name"
                                    value={newField || ""}
                                    onChange={handleNewFieldChange}
                                    placeholder="e.g. jobTitle"
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleCreateField}>
                                Create Field
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {availableFields.slice(1).map((field) => (
                    <div
                        key={field}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field)}
                        className={cn(
                        "flex items-center p-3 border rounded-md cursor-move hover:bg-gray-50 transition-colors",
                        selectedFields.some((f) => f === field) ? "opacity-50" : "",
                        )}
                    >
                        <GripVertical className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{field}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
        <Card className="flex-1 rounded-none border-none">
            <CardContent className="overflow-y-auto h-full">
                <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "h-full overflow-y-auto border-2 border-dashed rounded-md p-4 transition-colors",
                        selectedFields.length === 0 ? "flex items-center justify-center" : "",
                    )}
                >
                    {selectedFields.length === 0 ? (
                        <span className="text-center text-muted-foreground">Drag fields here to add them to your form</span>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {selectedFields.map((field) => (
                            <div key={field} className="relative border rounded-md p-4 pr-10">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveField(field)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                    aria-label={`Remove ${field} field`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <div className="space-y-2">
                                    <Label htmlFor={field}>{field}</Label>
                                    <Input
                                        id={field}
                                        name={field}
                                        type="text"
                                        placeholder={field}
                                        value={formValues[field] || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            ))}
                            {selectedFields.length > 0 && (
                                <Button type="submit" className="mt-4">
                                    Submit Form
                                </Button>
                            )}
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
    )
}
