
import { useEffect, useState } from "react"
import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

import { generateColumns } from "/@/utils/generic-column-generator"
import { invoke } from "@tauri-apps/api/core"

interface DataTablePanelProps {
    fieldList: string[]
    data: never[]
}

export const DataTablePanel = ({
    fieldList,
    data
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList)

    return (
        <div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}