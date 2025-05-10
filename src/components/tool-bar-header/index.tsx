import { Edit, Plus, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"


export const ToolBarHeader = () => {
    return (
        <div className="p-3 flex justify-between">
            <div className="flex-1 px-3">
                <Input type="text" placeholder="e.g., name='Car'; model='Toyota'" />
            </div>
            <div className="flex gap-3 flex-1 justify-end">
                <Button variant="outline" size="icon">
                    <Edit />
                </Button>
                <Button variant="outline" size="icon">
                    <Trash />
                </Button>
                <Button variant="outline" size="icon">
                    <Plus />
                </Button>
            </div>
        </div>
    )
}