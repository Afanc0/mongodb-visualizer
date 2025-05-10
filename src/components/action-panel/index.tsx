import { ToolBarHeader } from "../tool-bar-header"
import { DataTablePanel } from "../data-table-panel"
import { CreateRecordPanel } from "../create-record-panel"

import { Collection } from "/@/types/databases-info"

interface ActionPanelProps {
    fieldList: string[]
    selectedCollection: Collection
}

export const ActionPanel = ({
    fieldList,
    selectedCollection
}: ActionPanelProps) => {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex-none border-b">
                <ToolBarHeader />
            </div>
            <div className="flex-1 border-b overflow-auto">
                <DataTablePanel 
                    fieldList={fieldList}
                    selectedCollection={selectedCollection}
                />
            </div>
            <div className="flex-1 overflow-auto">
                <CreateRecordPanel fieldList={fieldList} selectedCollection={selectedCollection}/>
            </div>
        </div>
    )
}