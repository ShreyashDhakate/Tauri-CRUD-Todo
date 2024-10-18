mod commands;
mod database;

use tauri::{Builder, generate_handler};
use commands::{initialize_db, insert_todo, get_todos, update_todo, delete_todo};

fn main() {
    Builder::default()
        .invoke_handler(generate_handler![
            initialize_db,
            insert_todo,
            get_todos,
            update_todo,
            delete_todo
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
