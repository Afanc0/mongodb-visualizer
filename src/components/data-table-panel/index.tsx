import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

import { generateColumns } from "/@/utils/generic-column-generator"

interface DataTablePanelProps {
    fieldList: string[]
    data: any[]
    selectedCollection: Collection
    onFetchRecords: (dbName: string, doc: Object, collName: string) => Promise<void>
    onGetCollectionFields: (dbName: string, collName: string) => Promise<void>
}

export const DataTablePanel = ({
    fieldList,
    data,
    selectedCollection,
    onFetchRecords,
    onGetCollectionFields
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList)
    return (
        <div>
            <DataTable 
                columns={columns} 
                data={data} 
                selectedCollection={selectedCollection}
                onFetchRecords={onFetchRecords}
                onGetCollectionFields={onGetCollectionFields}
            />
        </div>
    )
}