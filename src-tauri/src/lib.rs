// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use mongodb::bson::doc;
use mongodb::bson::Document;

use mongodb::options::WriteModel;
use mongodb::options::DeleteOneModel;

use mongodb::bson::oid::ObjectId;

use serde_json::Value;

mod db_client;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn find_many(
    db: String,
    coll: String,
    doc_json: String
) -> Result<String, String> {
    let doc: Document = serde_json::from_str(&doc_json)
        .map_err(|e| format!("Failed to parse JSON document: {}", e))?;

    match db_client::find_many(&coll, doc, &db).await {
        Ok(docs) => {
            let json_docs = serde_json::to_string(&docs).map_err(|e| e.to_string())?;
            Ok(json_docs)
        }
        Err(e) => Err(format!("Failed to find documents: {}", e)),
    }
}

#[tauri::command]
async fn insert_one(
    db: String,
    coll: String,
    doc_json: String
) -> Result<String, String> {
    let doc: Document = serde_json::from_str(&doc_json)
        .map_err(|e| format!("Failed to parse JSON document: {}", e))?;

    db_client::insert_one(&coll, doc, &db)
        .await
        .map(|id| id.to_hex())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_many(
    db: String,
    coll: String,
    operations_json: String
) -> Result<u64, String> {
    let operations: Vec<Document> = serde_json::from_str(&operations_json)
        .map_err(|e| format!("Failed to parse operations JSON: {}", e))?;

    db_client::delete_many(&coll, operations, &db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn bulk_delete(
    db: String,
    coll: String,
    doc_json: String
) {
    let ns = db_client::get_namespace(&db, &coll);
    let docs: Result<Vec<Value>, _> = serde_json::from_str(&doc_json);

    let mut models: Vec<WriteModel> = Vec::new();

    for doc in docs {
        for d in doc {
            if let Some(str_val) = d.as_str() {
                models.push(
                    WriteModel::DeleteOne(
                        DeleteOneModel::builder()
                            .namespace(ns.clone().expect("REASON").namespace())
                            .filter(doc! {"_id": ObjectId::parse_str(str_val).unwrap()})
                            .build()
                    )
                );
            }
        }
    }

    db_client::bulk_delete(models).await
        .map_err(|e| e.to_string())
        .map(|result| {
            println!("Bulk delete result: {:?}", result);
        })
        .unwrap_or_else(|e| {
            println!("Bulk delete error: {}", e);
        });
}

#[tauri::command]
async fn list_databases() -> Result<Vec<db_client::DatabaseInfo>, String> {
    db_client::list_databases()
        .await
        .map_err(|e| e.to_string())
}


#[tauri::command]
async fn get_collections(db_name: String) -> Result<Vec<String>, String> {
    db_client::fetch_collections(&db_name)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_collection_fields(db_name: String, coll_name: String) -> Result<Vec<String>, String> {
    db_client::fetch_collection_fields(&db_name, &coll_name)
        .await
        .map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            tauri::async_runtime::spawn(async {
                if let Err(e) = db_client::init_client().await {
                    eprintln!("MongoDB connection failed at startup: {}", e);
                } else {
                    println!("Successfully connected to MongoDB at startup!");
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            find_many,
            insert_one,
            delete_many,
            list_databases,
            get_collections,
            get_collection_fields,
            bulk_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
