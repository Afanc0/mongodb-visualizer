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
    const [records, setRecords] = useState<any[]>([])

    const [selectedCollection, setSelectedCollection] = useState<Collection>({ db: "", coll: "" })

    const handleFetchRecords = async (dbName: string, doc: Object, collName: string) => {
        setRecords(JSON.parse(await invoke("find_many", {
            db: dbName,
            coll: collName,
            docJson: JSON.stringify(doc)
        })))
    }

    const getCollectionFields = async (dbName: string, collName: string) => {
        setFields(await invoke("get_collection_fields", { dbName, collName }))
    }

    const handleSelectedCollection = (dbName: string, collName: string) => {
        setSelectedCollection({ db: dbName, coll: collName } as Collection)
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
                        <DatabaseExplorer 
                            itemList={databases} 
                            onGetCollectionFields={getCollectionFields}
                            onHandleSelectedCollection={handleSelectedCollection}
                            onFetchRecords={handleFetchRecords}
                        />
                    </section>
                    <section className="flex-1 overflow-hidden">
                        <ActionPanel 
                            fieldList={fields} 
                            records={records}
                            selectedCollection={selectedCollection}
                            onFetchRecords={handleFetchRecords}
                            onGetCollectionFields={getCollectionFields}
                        />
                    </section>
                </div>
            </main>
            <Toaster />
        </>
    )
}

export default Dashboard