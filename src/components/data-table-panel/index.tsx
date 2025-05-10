import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

import { generateColumns } from "/@/utils/generic-column-generator"

interface DataTablePanelProps {
    fieldList: string[]
    data: any[]
    selectedCollection: Collection
}

export const DataTablePanel = ({
    fieldList,
    data,
    selectedCollection
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList)

    return (
        <div>
            <DataTable columns={columns} data={data} selectedCollection={selectedCollection} />
        </div>
    )
}