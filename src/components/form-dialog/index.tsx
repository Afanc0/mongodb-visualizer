import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { SidebarMenuSubButton } from "../ui/sidebar";

interface FormDialogProps {
    onCreate: () => Promise<void>
}

export const FormDialog = ({
    onCreate
}: FormDialogProps) => {

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [data, setData] = React.useState("")

    return (
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
                            value={data}
                            onChange={e => setData(e.target.value)}
                            placeholder="e.g. name"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onCreate}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}