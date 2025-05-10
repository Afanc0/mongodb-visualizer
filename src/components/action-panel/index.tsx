import { ToolBarHeader } from "../tool-bar-header"
import { DataTablePanel } from "../data-table-panel"
import { CreateRecordPanel } from "../create-record-panel"

import { Collection } from "/@/types/databases-info"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"

interface ActionPanelProps {
    fieldList: string[]
    selectedCollection: Collection
}

export const ActionPanel = ({
    fieldList,
    selectedCollection
}: ActionPanelProps) => {

    const [data, setData] = useState([])

    const fetchRecords = async () => {
        setData(JSON.parse(await invoke("find_many", {
            db: selectedCollection.db,
            coll: selectedCollection.coll
        })))
    }

    useEffect(() => {
        if (fieldList) {
            fetchRecords()
        }
    }, [fieldList])

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-none border-b">
                <ToolBarHeader />
            </div>
            <div className="flex-1 border-b overflow-auto">
                <DataTablePanel 
                    fieldList={fieldList}
                    data={data}
                />
            </div>
            <div className="flex-1 overflow-auto">
                <CreateRecordPanel 
                    fieldList={fieldList}
                    selectedCollection={selectedCollection}
                    onFetchRecords={fetchRecords}
                />
            </div>
        </div>
    )
}