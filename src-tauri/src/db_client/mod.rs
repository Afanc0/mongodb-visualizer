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

    match client.database("admin").run_command(doc! { "ping": 1 }, None).await {
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
    let mut cursor = collection.find(filter, None).await?;
    let mut results = Vec::new();
    while let Some(doc) = cursor.next().await {
        results.push(doc?);
    }
    Ok(results)
}

#[allow(dead_code)]
pub async fn list_databases() -> Result<Vec<DatabaseInfo>> {
    let client = CLIENT.get().expect("MongoDB client not initialized");
    let dbs: Vec<DatabaseSpecification> = client
        .list_databases(None, None)
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
        .list_collection_names(None)
        .await?;
    Ok(collections)
}