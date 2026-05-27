use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
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

#[derive(serde::Deserialize, serde::Serialize)]
pub struct CreateReservaPayload {
    mesa_id: String,
    horario_inicio: String,
    horario_fim: String,
    numero_pessoas: u32,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct UpdateReservaPayload {
    horario_inicio: Option<String>,
    horario_fim: Option<String>,
    numero_pessoas: Option<u32>,
    status: Option<String>,
}

const BASE_URL: &str = "http://localhost:3000/api";

// ─── Auth ────────────────────────────────────────────────────────────────────

#[tauri::command]
async fn login_command(payload: LoginPayload) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/usuarios/login", BASE_URL))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}


#[tauri::command]
async fn register_command(payload: RegisterPayload) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/usuarios/register", BASE_URL))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_command(token: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    // Monta o cabeçalho de Autorização (Padrão Bearer Token)
    let mut headers = HeaderMap::new();
    let auth_value = format!("Bearer {}", token);

    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&auth_value).map_err(|e| format!("Erro ao gerar header: {}", e))?
    );

    // Faz uma requisição GET para o endpoint de validação do Elysia
    let res = client
        .get(format!("{}/usuarios/validate", BASE_URL))
        .headers(headers)
        .send()
        .await
        .map_err(|e| format!("Falha na requisição: {}", e))?;

    // Captura o JSON de resposta (que conterá o { ok: true, userId: ... })
    res.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Falha ao ler resposta do servidor: {}", e))
}

// ─── Reservas ────────────────────────────────────────────────────────────────

/// getAll — todas as reservas (funcionário)
/// params opcionais: mesa_id, status, data
#[tauri::command]
async fn get_reservas_command(
    token: String,
    mesa_id: Option<String>,
    status: Option<String>,
    data: Option<String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let mut req = client
        .get(format!("{}/reservas", BASE_URL))
        .header("Authorization", format!("Bearer {}", token));

    // Monta query params dinamicamente
    let mut params: Vec<(&str, String)> = vec![];
    if let Some(v) = mesa_id  { params.push(("mesaId", v)); }
    if let Some(v) = status   { params.push(("status", v)); }
    if let Some(v) = data     { params.push(("data", v)); }

    if !params.is_empty() {
        req = req.query(&params);
    }

    req.send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())
}

/// getMinhas — reservas do cliente autenticado
/// param opcional: status
#[tauri::command]
async fn get_minhas_reservas_command(
    token: String,
    status: Option<String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let mut req = client
        .get(format!("{}/reservas/minhas", BASE_URL))
        .header("Authorization", format!("Bearer {}", token));

    if let Some(s) = status {
        req = req.query(&[("status", s)]);
    }

    req.send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())
}

/// getDisponibilidade — mesas disponíveis em um horário
#[tauri::command]
async fn get_disponibilidade_command(
    horario_inicio: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}/reservas/disponibilidade", BASE_URL))
        .header("Authorization", format!("Bearer {}", token))
        .query(&[("horarioInicio", horario_inicio)])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// getRelatorio — relatório de reservas por período (admin)
#[tauri::command]
async fn get_relatorio_command(
    data_inicio: String,
    data_fim: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}/reservas/relatorio", BASE_URL))
        .header("Authorization", format!("Bearer {}", token))
        .query(&[("dataInicio", &data_inicio), ("dataFim", &data_fim)])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// create — criar nova reserva (autenticado)
#[tauri::command]
async fn create_reserva_command(
    payload: CreateReservaPayload,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/reservas", BASE_URL))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// criarPagamento — inicia pagamento de uma reserva
#[tauri::command]
async fn criar_pagamento_command(
    id: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/reservas/{}/pagamento", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Length", "0")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}


/// confirmarPresenca — funcionário confirma presença do cliente
#[tauri::command]
async fn confirmar_presenca_command(
    id: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/reservas/{}/confirmar-presenca", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Length", "0")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// cancelar — cancela reserva (autenticado)
#[tauri::command]
async fn cancelar_reserva_command(
    id: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .patch(format!("{}/reservas/{}/cancelar", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// update — atualiza reserva (funcionário)
#[tauri::command]
async fn update_reserva_command(
    id: String,
    payload: UpdateReservaPayload,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .patch(format!("{}/reservas/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Auth
            login_command,
            register_command,
            validate_command,

            // Reservas — leitura
            get_reservas_command,
            get_minhas_reservas_command,
            get_disponibilidade_command,
            get_relatorio_command,

            // Reservas — escrita
            create_reserva_command,
            criar_pagamento_command,
            confirmar_presenca_command,
            cancelar_reserva_command,
            update_reserva_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
