import { DataTablePanel } from "../data-table-panel"
import { CreateRecordPanel } from "../create-record-panel"

import { Collection } from "/@/types/databases-info"

import { Record } from "/@/types/record"

interface ActionPanelProps {
    fieldList: string[]
    records: Record[]
    selectedCollection: Collection
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
}

export const ActionPanel = ({
    fieldList,
    records,
    onFetchRecords: fetchRecords,
    selectedCollection,
    onGetCollectionFields
}: ActionPanelProps) => {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 border-b overflow-auto">
                <DataTablePanel 
                    fieldList={fieldList}
                    records={records}
                    selectedCollection={selectedCollection}
                    onFetchRecords={fetchRecords}
                    onGetCollectionFields={onGetCollectionFields}
                />
            </div>
            <div className="flex-1 overflow-auto">
                <CreateRecordPanel 
                    fieldList={fieldList}
                    selectedCollection={selectedCollection}
                    onFetchRecords={fetchRecords}
                    onGetCollectionFields={onGetCollectionFields}
                />
            </div>
        </div>
    )
}