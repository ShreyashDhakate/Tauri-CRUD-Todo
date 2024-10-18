use crate::database::get_db_connection;
use mysql::{params, PooledConn};
use mysql::prelude::Queryable;
use tauri::command;
use serde::Serialize;

#[derive(Serialize)]
pub struct Todo {
    pub id: u32,
    pub title: String,
    pub is_completed: bool,
}

#[command]
pub async fn initialize_db() -> Result<String, String> {
    let mut conn = get_db_connection()?;
    conn.query_drop(
        r"CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            is_completed TINYINT(1) NOT NULL DEFAULT 0
        )",
    )
    .map_err(|e| e.to_string())?;

    Ok("Database initialized successfully.".to_string())
}

#[command]
pub async fn insert_todo(title: String, is_completed: bool) -> Result<String, String> {
    let mut conn = get_db_connection()?;
    conn.exec_drop(
        "INSERT INTO tasks (title, is_completed) VALUES (:title, :is_completed)",
        params! {
            "title" => title,
            "is_completed" => if is_completed { 1 } else { 0 },
        },
    )
    .map_err(|e| e.to_string())?;

    Ok("Todo inserted successfully.".to_string())
}

#[command]
pub fn get_todos() -> Result<Vec<Todo>, String> {
    let mut conn = get_db_connection()?;

    let todos = conn
        .query_map(
            "SELECT id, title, is_completed FROM tasks",
            |(id, title, is_completed)| Todo {
                id,
                title,
                is_completed,
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(todos)
}

#[command]
pub async fn update_todo(id: u32, title: String, is_completed: bool) -> Result<String, String> {
    let mut conn = get_db_connection()?;
    conn.exec_drop(
        "UPDATE tasks SET title = :title, is_completed = :is_completed WHERE id = :id",
        params! {
            "id" => id,
            "title" => title,
            "is_completed" => if is_completed { 1 } else { 0 },
        },
    )
    .map_err(|e| e.to_string())?;

    Ok("Todo updated successfully.".to_string())
}

#[command]
pub async fn delete_todo(id: u32) -> Result<String, String> {
    let mut conn = get_db_connection()?;
    conn.exec_drop("DELETE FROM tasks WHERE id = :id", params! { "id" => id })
        .map_err(|e| e.to_string())?;

    Ok("Todo deleted successfully.".to_string())
}
