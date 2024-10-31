use mongodb::{options::ClientOptions, Client, Database};
use dotenv::dotenv;
use std::env;
use once_cell::sync::Lazy;
use tokio::sync::Mutex;
use std::time::Duration;

static CLIENT: Lazy<Mutex<Option<Client>>> = Lazy::new(|| Mutex::new(None));

pub async fn get_db_connection() -> Result<Database, String> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").map_err(|e| e.to_string())?;
    let mut client_lock = CLIENT.lock().await;

    if client_lock.is_none() {
        let mut client_options = ClientOptions::parse(&database_url)
            .await
            .map_err(|e| e.to_string())?;
        client_options.server_selection_timeout = Some(Duration::from_secs(10));
        client_options.connect_timeout = Some(Duration::from_secs(10));

        let client = Client::with_options(client_options).map_err(|e| e.to_string())?;
        *client_lock = Some(client);
    }

    let client = client_lock.as_ref().unwrap();
    Ok(client.database("todo_db"))
}
