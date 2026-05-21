import { invoke } from "@tauri-apps/api/core";
import { ApiResponse } from "../types/api";


export interface ReservaData {
  id: string;
  horarioInicio: string; // ISO String vinda do banco
  horarioFim: string;
  statusPagamento: "PENDENTE" | "PAGO" | "CANCELADO";
  mesa: {
    numero: number;
  };
  usuario: {
    nome: string;
  };
}

export const reservasService = {
  listarTodas: async (): Promise<ApiResponse<ReservaData[]>> => {
    try {
      const token = localStorage.getItem("token") || "";

      return await invoke<ApiResponse<ReservaData[]>>("get_reservas_command", { token });
    } catch (error) {
      console.error("Erro no invoke get_reservas_command:", error);
      return {
        ok: false,
        message: "Erro ao buscar reservas do servidor local.",
        data: [],
      };
    }
  },

  listarMinhas: async (): Promise<ApiResponse<ReservaData[]>> => {
    try {
      const token = localStorage.getItem("token") || "";
      return await invoke<ApiResponse<ReservaData[]>>("get_minhas_reservas_command", { token });
    } catch (error) {
      console.error("Erro no invoke listarMinhas:", error);
      return { ok: false, message: "Erro ao buscar as suas reservas.", data: [] };
    }
  }
};