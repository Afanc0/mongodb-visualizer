// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use mongodb::bson::doc;

mod db_client;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn find_many() -> Result<String, String> {
    match db_client::find_many("cats", doc! {}, "animals").await {
        Ok(docs) => {
            let json_docs = serde_json::to_string(&docs).map_err(|e| e.to_string())?;
            Ok(json_docs)
        }
        Err(e) => Err(format!("Failed to find documents: {}", e)),
    }
}

#[tauri::command]
async fn list_databases() -> Result<Vec<db_client::DatabaseInfo>, String> {
    db_client::list_databases()
        .await
        .map_err(|e| e.to_string())  // Convert error to a string
}


#[tauri::command]
async fn get_collections(db_name: String) -> Result<Vec<String>, String> {
    db_client::fetch_collections(&db_name)
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
            list_databases,
            get_collections
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
