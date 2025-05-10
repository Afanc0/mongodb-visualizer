
import { useEffect, useState } from "react"
import { DataTable } from "./data-table"
import { Collection } from "/@/types/databases-info"

import { generateColumns } from "/@/utils/generic-column-generator"
import { invoke } from "@tauri-apps/api/core"

interface DataTablePanelProps {
    fieldList: string[]
    selectedCollection: Collection
}

export const DataTablePanel = ({
    fieldList,
    selectedCollection
}: DataTablePanelProps) => {
    const columns = generateColumns(fieldList)
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchRecords = async () => {
            if (fieldList) {
                setData(JSON.parse(await invoke("find_many", {
                    db: selectedCollection.db,
                    coll: selectedCollection.coll
                })))
            }
        }
        fetchRecords()
    }, [fieldList])

    return (
        <div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}