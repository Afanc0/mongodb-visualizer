import { DatabaseExplorer } from "./components/database-explorer"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"

import { DatabaseInfo } from "./types/databases-info"

function Dashboard() {

    const [databases, setDatabases] = useState<DatabaseInfo[]>([])

    useEffect(() => {
        const getMongoDatabases = async () => setDatabases(await invoke("list_databases"))
        getMongoDatabases()
    }, [])

    return (
        <>
            <main>
                <div className="p-3 bg-[#3C3D37]">
                    <DatabaseExplorer itemList={databases}/>
                </div>
            </main>
        </>
    )
}

export default Dashboard