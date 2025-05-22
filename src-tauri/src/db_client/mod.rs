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

use std::time::Duration;

use std::sync::Mutex;

static CLIENT: Lazy<OnceCell<Client>> = Lazy::new(OnceCell::new);

static URI: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(String::new()));

#[derive(Serialize)] 
pub struct DatabaseInfo {
    pub name: String,
    pub size_on_disk: u64,
}

pub fn set_connection_string(connection_string: &str) {
    let mut uri = URI.lock().unwrap();
    *uri = connection_string.to_string();
}

fn get_connection_string() -> String {
    URI.lock().unwrap().clone()
}

#[allow(dead_code)]
pub async fn init_client() -> bool {
    let uri = get_connection_string();

    let client_options = match ClientOptions::parse(&uri).await {
        Ok(mut opts) => {
            opts.server_selection_timeout = Some(Duration::from_secs(2));
            opts.server_api = Some(ServerApi::builder().version(ServerApiVersion::V1).build());
            opts
        }
        Err(_) => return false,
    };

    let client = match Client::with_options(client_options) {
        Ok(c) => c,
        Err(_) => return false,
    };

    match client.database("admin").run_command(doc! { "ping": 1 }).await {
        Ok(_) => {
            println!("MongoDB connected.");

            // Set once, ignore if already initialized
            let _ = CLIENT.set(client);
            true
        }
        Err(_) => {
            eprintln!("Mongod.service is not running.");
            false
        }
    }
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

#[allow(dead_code)] 
pub async fn create_collection(db_name: &str, coll_name: &str) -> mongodb::error::Result<()> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let db = client.database(db_name);
    db.create_collection(coll_name).await?;
    Ok(())
}

#[allow(dead_code)]
pub async fn drop_collection(db_name: &str, coll_name: &str) -> mongodb::error::Result<()> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let db = client.database(db_name);
    db.collection::<Document>(coll_name).drop().await?;
    Ok(())
}

#[allow(dead_code)]
pub async fn drop_database(db_name: &str) -> mongodb::error::Result<()> {
    let client: &Client = CLIENT.get().expect("MongoDB client not initialized");
    let db = client.database(db_name);
    db.drop().await?;
    Ok(())
}
