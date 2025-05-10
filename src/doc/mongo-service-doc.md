# 📚 MongoDB Tauri Service Documentation

This document outlines the available Tauri commands exposed for MongoDB operations in your Tauri application.

---

## ⚙️ Commands Overview

| Command               | Description                                  |
|-----------------------|----------------------------------------------|
| `greet`               | Sample test command for Tauri connection     |
| `find_many`           | Fetches all documents from a hardcoded collection |
| `insert_one`          | Inserts a document into a specified collection |
| `delete_many`         | Deletes multiple documents using filters     |
| `list_databases`      | Lists available MongoDB databases            |
| `get_collections`     | Lists collections in a given database        |
| `get_collection_fields` | Lists all unique field names in a collection |

---

## 🧪 `greet(name: &str) -> String`

**Description:**  
Returns a greeting message from Rust.

**Example:**
```ts
await invoke("greet", { name: "Alice" });
// → "Hello, Alice! You've been greeted from Rust!"
```

---

## 📥 `insert_one(db, coll, doc_json) -> Result<ObjectIdHex, String>`

**Description:**  
Inserts a single document into the specified collection.

**Parameters:**
- `db`: Database name
- `coll`: Collection name
- `doc_json`: JSON string of the document

**Example:**
```ts
await invoke("insert_one", {
  db: "animals",
  coll: "cats",
  docJson: JSON.stringify({ name: "Whiskers", age: 2 })
});
```

---

## 📤 `find_many(db, coll) -> Result<JSON, String>`

**Description:**  
Finds all documents in the `cats` collection in the `animals` database.

**Parameters:**
- `db`: Database name
- `coll`: Collection name

**Example:**
```ts
const data = await invoke("find_many", {
    db: "animals",
    coll: "cats"
});
console.log(JSON.parse(data));
```

---

## ❌ `delete_many(db, coll, operations_json) -> Result<u64, String>`

**Description:**  
Deletes multiple documents that match each filter provided.

**Parameters:**
- `db`: Database name
- `coll`: Collection name
- `operations_json`: JSON array of filter objects

**Example:**
```ts
await invoke("delete_many", {
  db: "animals",
  coll: "cats",
  operationsJson: JSON.stringify([{ age: { $lt: 1 } }])
});
```

---

## 📂 `list_databases() -> Result<DatabaseInfo[], String>`

**Description:**  
Returns a list of available MongoDB databases.

**Example:**
```ts
const databases = await invoke("list_databases");
console.log(databases); // Array of { name: string, sizeOnDisk: number }
```

---

## 📁 `get_collections(db_name) -> Result<String[], String>`

**Description:**  
Fetches all collection names in the given database.

**Example:**
```ts
const collections = await invoke("get_collections", { dbName: "animals" });
```

---

## 🧾 `get_collection_fields(db_name, coll_name) -> Result<String[], String>`

**Description:**  
Returns all unique field names used across documents in the specified collection.

**Example:**
```ts
const fields = await invoke("get_collection_fields", {
  dbName: "animals",
  collName: "cats"
});
```

---

### 🔧 Notes

- All commands use `serde_json` to serialize/deserialize between Rust and TypeScript.
- Ensure MongoDB connection is properly initialized before calling commands.
- Error messages are returned as `String` for frontend handling.