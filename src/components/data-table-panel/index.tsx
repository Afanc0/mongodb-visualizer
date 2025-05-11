import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

import { generateColumns } from "/@/utils/generic-column-generator"

interface DataTablePanelProps {
    fieldList: string[]
    data: any[]
    selectedCollection: Collection
    onFetchRecords: (arg: any) => Promise<void>
}

export const DataTablePanel = ({
    fieldList,
    data,
    selectedCollection,
    onFetchRecords
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList)

    return (
        <div>
            <DataTable 
                columns={columns} 
                data={data} 
                selectedCollection={selectedCollection}
                onFetchRecords={onFetchRecords}
            />
        </div>
    )
}