use mongodb::{ 
    bson::{doc, Document, oid::ObjectId}, 
    error::Result,
    results::{UpdateResult},
    options::{ ClientOptions, ServerApi, ServerApiVersion }, 
    Client,
    Collection
};
use tokio::sync::OnceCell;
use once_cell::sync::Lazy;
use futures::stream::StreamExt;

use mongodb::results::DatabaseSpecification;
use serde::Serialize;

use mongodb::options::WriteModel;

static CLIENT: Lazy<OnceCell<Client>> = Lazy::new(OnceCell::new);

#[derive(Serialize)] 
pub struct DatabaseInfo {
    pub name: String,
    pub size_on_disk: u64,
}

#[allow(dead_code)]
pub async fn init_client() -> Result<()> {
    let uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2";

    let mut client_options = ClientOptions::parse(uri).await?;
    let server_api = ServerApi::builder().version(ServerApiVersion::V1).build();
    client_options.server_api = Some(server_api);
    let client = Client::with_options(client_options)?;

    match client.database("admin").run_command(doc! { "ping": 1 }).await {
        Ok(_) => {
            println!("MongoDB connected.");
            CLIENT.set(client).unwrap_or_else(|_| panic!("Client already initialized"));
        }
        Err(e) => {
            eprintln!("Mongod.service is not running.");
            return Err(e);
        }
    }
    
    Ok(())
}

#[allow(dead_code)]
pub async fn find_many(coll: &str, filter: Document, db: &str) -> Result<Vec<Document>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collection = client.database(db).collection::<Document>(coll);
    let mut cursor = collection.find(filter).await?;
    let mut results = Vec::new();
    while let Some(doc) = cursor.next().await {
        results.push(doc?);
    }
    Ok(results)
}

#[allow(dead_code)]
pub async fn insert_one(coll: &str, doc: Document, db: &str) -> Result<ObjectId> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collection: Collection<Document> = client.database(db).collection(coll);

    let result = collection.insert_one(doc).await?;
    let inserted_id = result
        .inserted_id
        .as_object_id()
        .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::Other, "inserted_id is not an ObjectId"))?;

    Ok(inserted_id)
}


#[allow(dead_code)]
pub async fn delete_many(coll: &str, operations: Vec<Document>, db: &str) -> Result<u64> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collection = client.database(db).collection::<Document>(coll);
    
    let mut deleted_count = 0;
    for filter in operations {
        let result = collection.delete_many(filter).await?;
        deleted_count += result.deleted_count;
    }

    Ok(deleted_count)
}

#[allow(dead_code)]
pub async fn bulk_delete(models: Vec<WriteModel>) -> Result<i64> {
    let client = CLIENT.get().expect("MongoDB client not initialized"); 
    let result = client.bulk_write(models).await?;
    Ok(result.deleted_count)
}

#[allow(dead_code)]
pub async fn update_one(coll: &str, filter: Document, update: Document, db: &str) -> Result<u64> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collection = client.database(db).collection::<Document>(coll);
    let result: UpdateResult = collection.update_one(filter, update).await?;
    Ok(result.modified_count)
}

#[allow(dead_code)]
pub async fn list_databases() -> Result<Vec<DatabaseInfo>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let dbs: Vec<DatabaseSpecification> = client
        .list_databases()
        .await?;
    let databases = dbs
        .into_iter()
        .filter_map(|spec| {
            Some(DatabaseInfo {
                name: spec.name,                          
                size_on_disk: spec.size_on_disk,          
            })
        })
        .collect();
    Ok(databases)
}

#[allow(dead_code)]
pub async fn fetch_collections(db_name: &str) -> Result<Vec<String>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collections = client
        .database(db_name)
        .list_collection_names()
        .await?;
    Ok(collections)
}

#[allow(dead_code)]
pub async fn fetch_collection_fields(db_name: &str, coll_name: &str) -> Result<Vec<String>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let collection = client.database(db_name).collection::<Document>(coll_name);

    let pipeline = vec![
        doc! { "$project": { "keys": { "$objectToArray": "$$ROOT" } }},
        doc! { "$project": { "keys": "$keys.k" }},
        doc! { "$group": { "_id": null, "allKeys": { "$addToSet": "$keys" }}},
        doc! { "$project": {
            "allKeys": {
                "$reduce": {
                    "input": "$allKeys",
                    "initialValue": [],
                    "in": { "$setUnion": ["$$value", "$$this"] }
                }
            }
        }},
    ];

    let mut cursor = collection.aggregate(pipeline).await?;
    if let Some(Ok(doc)) = cursor.next().await {
        if let Some(keys) = doc.get_array("allKeys").ok() {
            let key_strings = keys.iter().filter_map(|k| k.as_str().map(String::from)).collect();
            return Ok(key_strings);
        }
    }
    Ok(vec![])
}

#[allow(dead_code)]
pub fn get_namespace(db_name: &str, coll_name: &str) -> Result<Collection<Document>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let namespace = client.database(db_name).collection::<Document>(coll_name);

    Ok(namespace)
}