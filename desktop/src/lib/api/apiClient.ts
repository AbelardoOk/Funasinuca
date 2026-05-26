import { invoke } from "@tauri-apps/api/core";

export async function apiFetch<T>(command: string, payload?: any): Promise<T> {
  try {
    const response = await invoke<T>(command, { payload });
    return response;
  } catch (error) {
    console.error(`Erro no comando ${command}:`, error);
    throw error;
  }
}