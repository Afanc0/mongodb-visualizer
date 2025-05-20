import { DatabaseExplorer } from "./components/database-explorer"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"

import { DatabaseInfo } from "./types/databases-info"
import { ActionPanel } from "./components/action-panel"

import { Collection } from "./types/databases-info"
import { Toaster } from "./components/ui/sonner"

import { Record } from "./types/record"
import { ServiceDisconnected } from "./components/service-disconnected"
import { useMongoConnection } from "./hooks/use-mongo-connection"
import { toast } from "sonner"

function Dashboard() {
    const [databases, setDatabases] = useState<DatabaseInfo[]>([])
    const [fields, setFields] = useState<string[]>([])
    const [records, setRecords] = useState<Record[]>([])

    const [isServiceRunning, setIsServiceRunning]= useMongoConnection()

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

    const handleServiceConnection = async () => {
        setIsServiceRunning(await invoke("connect_mongo_service"))
        if (!isServiceRunning) {
            toast("Service is not currently running.", {
                description: "Please ensure MongoDB is running and try again.",
            })
        }
    }

    useEffect(() => {
        if (isServiceRunning) {
            const getMongoDatabases = async () => setDatabases(await invoke("list_databases"))
            getMongoDatabases()
        } else {
            setDatabases([])
        }
    }, [isServiceRunning])
    
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
                    {isServiceRunning ? (
                        <section className="flex-1 overflow-hidden">
                            <ActionPanel 
                                fieldList={fields} 
                                records={records}
                                selectedCollection={selectedCollection}
                                onFetchRecords={handleFetchRecords}
                                onGetCollectionFields={getCollectionFields}
                            />
                        </section>
                    ) : (
                        <div className="w-full h-screen flex items-center justify-center px-4">
                            <ServiceDisconnected serviceName="MongoDB" onConnection={handleServiceConnection}>
                                <span>Make sure to start your local Mongo server and then link account.</span>
                            </ServiceDisconnected>
                        </div>
                    )}
                </div>
            </main>
            <Toaster />
        </>
    )
}

export default Dashboard