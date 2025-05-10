import { DatabaseExplorer } from "./components/database-explorer"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"

import { DatabaseInfo } from "./types/databases-info"
import { ActionPanel } from "./components/action-panel"

import { Collection } from "./types/databases-info"
import { Toaster } from "./components/ui/sonner"

function Dashboard() {

    const [databases, setDatabases] = useState<DatabaseInfo[]>([])
    const [fields, setFields] = useState<string[]>([])

    const [selectedCollection, setSelectedCollection] = useState<Collection>({ db: "", coll: "" })

    const getCollectionFields = async (dbName: string, collName: string) => {
        setSelectedCollection({ db: dbName, coll: collName } as Collection)
        setFields(await invoke("get_collection_fields", { dbName, collName }))
    }

    useEffect(() => {
        const getMongoDatabases = async () => setDatabases(await invoke("list_databases"))
        getMongoDatabases()
    }, [])

    return (
        <>
            <main>
                <div className="flex flex-row">
                    <section>
                        <DatabaseExplorer itemList={databases} onGetCollectionFields={getCollectionFields} />
                    </section>
                    <section className="flex-1 overflow-hidden">
                        <ActionPanel fieldList={fields} selectedCollection={selectedCollection}/>
                    </section>
                </div>
            </main>
            <Toaster />
        </>
    )
}

export default Dashboard