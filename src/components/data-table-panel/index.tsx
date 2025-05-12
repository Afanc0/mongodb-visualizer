import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

// import { generateColumns } from "/@/utils/generic-column-generator"

import { generateColumns } from "./columns"

import { Record } from "/@/types/record"

interface DataTablePanelProps {
    fieldList: string[]
    records: Record[]
    selectedCollection: Collection
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
}

export const DataTablePanel = ({
    fieldList,
    records,
    selectedCollection,
    onFetchRecords,
    onGetCollectionFields
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList, selectedCollection)
    return (
        <div>
            <DataTable 
                columns={columns} 
                data={records} 
                selectedCollection={selectedCollection}
                onFetchRecords={onFetchRecords}
                onGetCollectionFields={onGetCollectionFields}
            />
        </div>
    )
}