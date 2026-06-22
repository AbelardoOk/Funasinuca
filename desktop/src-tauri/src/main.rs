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
#[serde(rename_all = "camelCase")]
pub struct CreateReservaPayload {
    mesa_id: String,
    horario_inicio: String,
    horario_fim: String,
    numero_pessoas: u32,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateReservaPayload {
    horario_inicio: Option<String>,
    horario_fim: Option<String>,
    numero_pessoas: Option<u32>,
    status: Option<String>,
    pub mesa_id: Option<String>,
    pub preco: Option<f64>,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct CreateMesaPayload {
    numero: u32,
    capacidade: u32,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct UpdateMesaPayload {
    numero: Option<u32>,
    capacidade: Option<u32>,
    status: Option<String>,
    ativa: Option<bool>,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUsuarioPayload {
    pub nome: Option<String>,
    pub email: Option<String>,
    pub cpf: Option<String>,
    pub tipo: Option<String>,
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

// ─── Gerenciamento de Usuários ──────────────────────────────

/// getAll — Retorna a lista de todos os usuários do sistema (Requer permissão funcionario)
#[tauri::command]
async fn get_usuarios_command(token: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}/usuarios", BASE_URL))
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// update — Atualiza dados parciais ou cargo (role) de um usuário específico via PATCH
#[tauri::command]
async fn update_usuario_command(
    id: String,
    payload: UpdateUsuarioPayload,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .patch(format!("{}/usuarios/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// delete — Remove de forma definitiva uma credencial do sistema baseado no ID
#[tauri::command]
async fn delete_usuario_command(id: String, token: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .delete(format!("{}/usuarios/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
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

    // println!("=== [Tauri Command] update_reserva_command ===");
    // println!("ID recebido do Front: {}", id);

    let client = reqwest::Client::new();
    let res = client
        .patch(format!("{}/reservas/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| {
            println!("Erro ao enviar requisição HTTP: {}", e);
            e.to_string()
        })?;
    // println!("Status HTTP do Elysia: {}", res.status());

    let json_res = res.json::<serde_json::Value>().await.map_err(|e| e.to_string())?;

    // println!("Resposta JSON enviada de volta ao Front: {:?}", json_res);
    // println!("===============================================");

    Ok(json_res)
}

// ─── Mesas (Novos Comandos do Arquivo Anexado) ──────────────────────────────

/// getAll — Busca todas as mesas aplicando filtros opcionais por query parameters
#[tauri::command]
async fn get_mesas_command(
    token: String,
    status: Option<String>,
    ativa: Option<String>,
    numero: Option<String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let mut req = client
        .get(format!("{}/mesas", BASE_URL))
        .header("Authorization", format!("Bearer {}", token));

    let mut query_params: Vec<(&str, String)> = vec![];
    if let Some(s) = status { query_params.push(("status", s)); }
    if let Some(a) = ativa  { query_params.push(("ativa", a)); }
    if let Some(n) = numero { query_params.push(("numero", n)); }

    if !query_params.is_empty() {
        req = req.query(&query_params);
    }

    req.send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())
}

/// create — Registra uma nova mesa no banco através de um método POST
#[tauri::command]
async fn create_mesa_command(
    payload: CreateMesaPayload,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/mesas", BASE_URL))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// update — Altera parcialmente dados estruturais ou estados de uma mesa específica via PATCH
#[tauri::command]
async fn update_mesa_command(
    id: String,
    payload: UpdateMesaPayload,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .patch(format!("{}/mesas/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// delete — Remove de forma lógica ou física uma mesa do sistema com base no ID fornecido
#[tauri::command]
async fn delete_mesa_command(
    id: String,
    token: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .delete(format!("{}/mesas/{}", BASE_URL, id))
        .header("Authorization", format!("Bearer {}", token))
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

            // Gerenciamento de Usuários (Novos manipuladores registrados)
            get_usuarios_command,
            update_usuario_command,
            delete_usuario_command,

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

            // Mesas (Adicionados ao Handler do Tauri)
            get_mesas_command,
            create_mesa_command,
            update_mesa_command,
            delete_mesa_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
