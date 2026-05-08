#[tauri::command]
async fn fetch_api_data() -> Result<String, String> {
    let api_url = std::env::var("API_URL").unwrap_or_else(|_| "http://localhost:3000".into());

    let client = reqwest::Client::new();
    let res = client.get(format!("{}/endpoint", api_url))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.text().await.map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch_api_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
