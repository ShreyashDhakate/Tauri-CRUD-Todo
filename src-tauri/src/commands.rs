use crate::database::get_db_connection;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::Collection;
use serde::{Deserialize, Serialize};
use tauri::command;
use futures_util::StreamExt;

#[derive(Serialize, Deserialize, Debug)]
pub struct Todo {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub is_completed: bool,
}

#[command]
pub async fn initialize_db() -> Result<String, String> {
    let db = get_db_connection().await?;
    db.collection::<Todo>("todo");
    Ok("Database initialized successfully.".to_string())
}

#[command]
pub async fn insert_todo(title: String, is_completed: bool) -> Result<String, String> {
    let db = get_db_connection().await?;
    let collection: Collection<Todo> = db.collection("todo");

    let new_todo = Todo {
        id: None,
        title,
        is_completed,
    };

    collection
        .insert_one(new_todo, None)
        .await
        .map_err(|e| format!("Failed to insert todo: {}", e))?;

    Ok("Todo inserted successfully.".to_string())
}

#[command]
pub async fn get_todos() -> Result<Vec<Todo>, String> {
    let db = get_db_connection().await?;
    let collection: Collection<Todo> = db.collection("todo");

    let cursor = collection
        .find(None, None)
        .await
        .map_err(|e| format!("Failed to fetch todos: {}", e))?;

    let todos: Vec<Todo> = cursor
        .filter_map(|doc| async { doc.ok() })
        .collect::<Vec<Todo>>()
        .await;

    Ok(todos)
}

#[command]
pub async fn update_todo(id: String, title: String, is_completed: bool) -> Result<String, String> {
    let db = get_db_connection().await?;
    let collection: Collection<Todo> = db.collection("todo");

    let object_id = ObjectId::parse_str(&id).map_err(|e| format!("Invalid ObjectId: {}", e))?;

    collection
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": { "title": title, "is_completed": is_completed }},
            None,
        )
        .await
        .map_err(|e| format!("Failed to update todo: {}", e))?;

    Ok("Todo updated successfully.".to_string())
}

#[command]
pub async fn delete_todo(id: String) -> Result<String, String> {
    let db = get_db_connection().await?;
    let collection: Collection<Todo> = db.collection("todo");

    let object_id = ObjectId::parse_str(&id).map_err(|e| format!("Invalid ObjectId: {}", e))?;

    collection
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| format!("Failed to delete todo: {}", e))?;

    Ok("Todo deleted successfully.".to_string())
}
