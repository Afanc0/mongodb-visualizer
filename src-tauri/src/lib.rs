// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use mongodb::bson::doc;
use mongodb::bson::Document;

mod db_client;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn find_many(
    db: String,
    coll: String,
) -> Result<String, String> {
    match db_client::find_many(&coll, doc! {}, &db).await {
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
            get_collection_fields
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
