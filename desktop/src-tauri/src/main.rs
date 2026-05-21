#[derive(serde::Deserialize, serde::Serialize)]
pub struct LoginPayload {
    email: String,
    senha: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct RegisterPayload {
    nome: String,
    email: String,
    cpf: String,
    senha: String,
}

#[tauri::command]
async fn login_command(payload: LoginPayload) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let res = client
        .post("http://localhost:3000/api/usuarios/login")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res.json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
    Ok(json)
}

#[tauri::command]
async fn register_command(payload: RegisterPayload) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    // Fazendo o POST para a rota do Elysia
    let res = client
        .post("http://localhost:3000/api/usuarios/register")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res.json::<serde_json::Value>().await.map_err(|e| e.to_string())?;
    Ok(json)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![login_command, register_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}