export interface DatabaseInfo {
    name: string
    size_on_disk: number
}

export interface Collection {
    db: string
    coll: string
} 