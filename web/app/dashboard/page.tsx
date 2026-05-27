"use client"

import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/navigation";

type Mesa = {
    id: number;
    numero: number;
    lugares: number;
    status: "disponivel" | "reservada" | "ocupada";
};

type Reserva = {
    mesaId: number;
    data: string;
    horario: string;
    nome: string;
};

// ── Dados mock (substituir por chamada à API)
const MESAS_MOCK: Mesa[] = [
    { id: 1, numero: 1, lugares: 4, status: "disponivel" },
    { id: 2, numero: 2, lugares: 4, status: "reservada" },
    { id: 3, numero: 3, lugares: 6, status: "disponivel" },
    { id: 4, numero: 4, lugares: 4, status: "ocupada" },
    { id: 5, numero: 5, lugares: 6, status: "disponivel" },
    { id: 6, numero: 6, lugares: 4, status: "disponivel" },
    { id: 7, numero: 7, lugares: 8, status: "reservada" },
    { id: 8, numero: 8, lugares: 4, status: "disponivel" },
];

const HORARIOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"];


function hojeISO() {
    return new Date().toISOString().split("T")[0];
}


export default function Dashboard() {
    const [token] = useLocalStorage("token", "");
    const router = useRouter();

    const [mesas] = useState<Mesa[]>(MESAS_MOCK);
    const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
    const [etapa, setEtapa] = useState<"lista" | "formulario" | "confirmado">("lista");
    const [reserva, setReserva] = useState<Reserva>({ mesaId: 0, data: hojeISO(), horario: "", nome: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [filtro, setFiltro] = useState<"todas" | "disponivel">("disponivel");

    // Logout
    function sair() {
        localStorage.removeItem("token");
        router.push("/login");
    }

    // Selecionar mesa
    function selecionarMesa(mesa: Mesa) {
        if (mesa.status !== "disponivel") return;
        setMesaSelecionada(mesa);
        setReserva(prev => ({ ...prev, mesaId: mesa.id }));
        setEtapa("formulario");
        setMsg("");
    }

    // Confirmar reserva
    async function confirmarReserva(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!reserva.horario) { setMsg("Selecione um horário."); return; }
        if (!reserva.nome.trim()) { setMsg("Informe seu nome."); return; }

        setLoading(true);
        setMsg("");

        try {
            // TODO: substituir pelo seu reservaService.criar(reserva, token)
            await new Promise(res => setTimeout(res, 1200));
            setEtapa("confirmado");
        } catch {
            setMsg("Erro ao realizar reserva. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    function novaReserva() {
        setMesaSelecionada(null);
        setReserva({ mesaId: 0, data: hojeISO(), horario: "", nome: "" });
        setEtapa("lista");
        setMsg("");
    }

    const mesasFiltradas = filtro === "todas" ? mesas : mesas.filter(m => m.status === "disponivel");


    return (
        <main style={s.page}>

            {/* ── Navbar ── */}
            <nav style={s.nav}>
                <div style={s.navBrand}>
                    <div style={s.navLogo}>🎱</div>
                    <span style={s.navTitle}>Funasinuca</span>
                </div>
                <button style={s.navBtn} onClick={sair}>Sair</button>
            </nav>

            {/* ── Content ── */}
            <div style={s.content}>

                {/* ── Etapa 1: Lista de mesas ── */}
                {etapa === "lista" && (
                    <>
                        <div style={s.pageHeader}>
                            <div>
                                <h2 style={s.pageTitle}>Reservar mesa</h2>
                                <p style={s.pageDesc}>Escolha uma mesa disponível para continuar</p>
                            </div>
                            <div style={s.filtros}>
                                <button
                                    style={{ ...s.filtroBtn, ...(filtro === "disponivel" ? s.filtroBtnAtivo : {}) }}
                                    onClick={() => setFiltro("disponivel")}
                                >
                                    Disponíveis
                                </button>
                                <button
                                    style={{ ...s.filtroBtn, ...(filtro === "todas" ? s.filtroBtnAtivo : {}) }}
                                    onClick={() => setFiltro("todas")}
                                >
                                    Todas
                                </button>
                            </div>
                        </div>

                        {/* Legenda */}
                        <div style={s.legenda}>
                            {(["disponivel", "reservada", "ocupada"] as const).map(st => (
                                <div key={st} style={s.legendaItem}>
                                    <div style={{ ...s.legendaDot, background: statusColor[st].dot }} />
                                    <span style={s.legendaLabel}>{statusLabel[st]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid de mesas */}
                        <div style={s.grid}>
                            {mesasFiltradas.map(mesa => (
                                <button
                                    key={mesa.id}
                                    style={{
                                        ...s.mesaCard,
                                        ...(mesa.status !== "disponivel" ? s.mesaCardDesabilitada : {}),
                                        ...(mesaSelecionada?.id === mesa.id ? s.mesaCardSelecionada : {}),
                                    }}
                                    onClick={() => selecionarMesa(mesa)}
                                    disabled={mesa.status !== "disponivel"}
                                    aria-label={`Mesa ${mesa.numero} — ${statusLabel[mesa.status]}`}
                                >
                                    <div style={s.mesaTop}>
                                        <span style={s.mesaNumero}>Mesa {mesa.numero}</span>
                                        <span style={{
                                            ...s.mesaBadge,
                                            background: statusColor[mesa.status].bg,
                                            color: statusColor[mesa.status].text,
                                        }}>
                                            {statusLabel[mesa.status]}
                                        </span>
                                    </div>
                                    <div style={s.mesaIconeWrap}>
                                        <span style={s.mesaIcone}>🪑</span>
                                        <span style={s.mesaLugares}>{mesa.lugares} lugares</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* ── Etapa 2: Formulário ── */}
                {etapa === "formulario" && mesaSelecionada && (
                    <div style={s.formWrap}>
                        <button style={s.voltarBtn} onClick={novaReserva}>← Voltar</button>

                        <div style={s.formCard}>
                            <div style={s.formHeader}>
                                <div style={s.formBadgeGrande}>Mesa {mesaSelecionada.numero}</div>
                                <p style={s.formSubtitle}>{mesaSelecionada.lugares} lugares · Disponível</p>
                            </div>

                            <form onSubmit={confirmarReserva} style={s.form}>
                                {/* Nome */}
                                <div style={s.fieldGroup}>
                                    <label style={s.label}>Seu nome</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: João Silva"
                                        value={reserva.nome}
                                        onChange={e => setReserva(prev => ({ ...prev, nome: e.target.value }))}
                                        style={s.input}
                                        onFocus={e => {
                                            (e.target as HTMLInputElement).style.borderColor = "#F5C518";
                                            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(245,197,24,0.18)";
                                        }}
                                        onBlur={e => {
                                            (e.target as HTMLInputElement).style.borderColor = "#E5E5E5";
                                            (e.target as HTMLInputElement).style.boxShadow = "none";
                                        }}
                                    />
                                </div>

                                {/* Data */}
                                <div style={s.fieldGroup}>
                                    <label style={s.label}>Data</label>
                                    <input
                                        type="date"
                                        required
                                        min={hojeISO()}
                                        value={reserva.data}
                                        onChange={e => setReserva(prev => ({ ...prev, data: e.target.value }))}
                                        style={s.input}
                                        onFocus={e => {
                                            (e.target as HTMLInputElement).style.borderColor = "#F5C518";
                                            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(245,197,24,0.18)";
                                        }}
                                        onBlur={e => {
                                            (e.target as HTMLInputElement).style.borderColor = "#E5E5E5";
                                            (e.target as HTMLInputElement).style.boxShadow = "none";
                                        }}
                                    />
                                </div>

                                {/* Horário */}
                                <div style={s.fieldGroup}>
                                    <label style={s.label}>Horário</label>
                                    <div style={s.horariosGrid}>
                                        {HORARIOS.map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                style={{
                                                    ...s.horarioBtn,
                                                    ...(reserva.horario === h ? s.horarioBtnAtivo : {}),
                                                }}
                                                onClick={() => setReserva(prev => ({ ...prev, horario: h }))}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {msg && (
                                    <div style={s.msgErro}><span>✕</span> {msg}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                                    onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.background = "#E0B400"; }}
                                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "#F5C518"; }}
                                >
                                    {loading ? "Confirmando..." : "Confirmar reserva"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Etapa 3: Confirmado ── */}
                {etapa === "confirmado" && (
                    <div style={s.confirmadoWrap}>
                        <div style={s.confirmadoCard}>
                            <div style={s.confirmadoIcone}>✓</div>
                            <h2 style={s.confirmadoTitulo}>Reserva confirmada!</h2>
                            <p style={s.confirmadoDesc}>
                                Sua mesa foi reservada com sucesso.
                            </p>
                            <div style={s.confirmadoDetalhes}>
                                <div style={s.confirmadoLinha}>
                                    <span style={s.confirmadoLabelDetalhe}>Mesa</span>
                                    <span style={s.confirmadoValorDetalhe}>Mesa {mesaSelecionada?.numero} · {mesaSelecionada?.lugares} lugares</span>
                                </div>
                                <div style={s.confirmadoLinha}>
                                    <span style={s.confirmadoLabelDetalhe}>Nome</span>
                                    <span style={s.confirmadoValorDetalhe}>{reserva.nome}</span>
                                </div>
                                <div style={s.confirmadoLinha}>
                                    <span style={s.confirmadoLabelDetalhe}>Data</span>
                                    <span style={s.confirmadoValorDetalhe}>{new Date(reserva.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                                </div>
                                <div style={s.confirmadoLinha}>
                                    <span style={s.confirmadoLabelDetalhe}>Horário</span>
                                    <span style={s.confirmadoValorDetalhe}>{reserva.horario}</span>
                                </div>
                            </div>
                            <button style={s.submitBtn} onClick={novaReserva}
                                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#E0B400"; }}
                                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "#F5C518"; }}
                            >
                                Fazer outra reserva
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// ── Status helpers ─────────────────────────────────────────────────────────
const statusLabel = { disponivel: "Disponível", reservada: "Reservada", ocupada: "Ocupada" };
const statusColor = {
    disponivel: { dot: "#48BB78", bg: "#F0FFF4", text: "#276749" },
    reservada:  { dot: "#F5C518", bg: "#FFFBEA", text: "#7B5E00" },
    ocupada:    { dot: "#FC8181", bg: "#FFF5F5", text: "#9B2C2C" },
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#F9F9F7",
        fontFamily: "'Geist', 'DM Sans', 'Inter', sans-serif",
    },

    // Nav
    nav: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#FFFFFF",
        borderBottom: "1px solid #EBEBEB",
        padding: "0 1.5rem",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    navBrand: { display: "flex", alignItems: "center", gap: "10px" },
    navLogo: {
        width: "34px", height: "34px", background: "#F5C518",
        borderRadius: "10px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px",
    },
    navTitle: { fontSize: "16px", fontWeight: 700, color: "#111111", letterSpacing: "-0.3px" },
    navBtn: {
        fontSize: "13px", fontWeight: 500, color: "#888",
        background: "none", border: "1px solid #E5E5E5",
        borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
    },

    // Content
    content: { maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" },

    // Page header
    pageHeader: {
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: "1rem", marginBottom: "1.25rem",
    },
    pageTitle: { fontSize: "22px", fontWeight: 700, color: "#111", margin: "0 0 4px", letterSpacing: "-0.4px" },
    pageDesc: { fontSize: "14px", color: "#888", margin: 0 },

    // Filtros
    filtros: { display: "flex", gap: "6px" },
    filtroBtn: {
        fontSize: "13px", fontWeight: 500, color: "#888",
        background: "#FFF", border: "1px solid #E5E5E5",
        borderRadius: "8px", padding: "7px 16px", cursor: "pointer",
    },
    filtroBtnAtivo: {
        background: "#111", color: "#FFF", borderColor: "#111",
    },

    // Legenda
    legenda: { display: "flex", gap: "1.25rem", marginBottom: "1.5rem" },
    legendaItem: { display: "flex", alignItems: "center", gap: "6px" },
    legendaDot: { width: "8px", height: "8px", borderRadius: "50%" },
    legendaLabel: { fontSize: "12px", color: "#666" },

    // Grid mesas
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "12px",
    },
    mesaCard: {
        background: "#FFF", border: "1.5px solid #EBEBEB",
        borderRadius: "14px", padding: "1rem 1rem 0.9rem",
        cursor: "pointer", textAlign: "left",
        transition: "border-color 0.15s, transform 0.1s, box-shadow 0.15s",
        display: "flex", flexDirection: "column", gap: "10px",
    },
    mesaCardDesabilitada: {
        opacity: 0.55, cursor: "not-allowed",
        background: "#FAFAFA",
    },
    mesaCardSelecionada: {
        borderColor: "#F5C518",
        boxShadow: "0 0 0 3px rgba(245,197,24,0.2)",
    },
    mesaTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    mesaNumero: { fontSize: "14px", fontWeight: 600, color: "#111" },
    mesaBadge: { fontSize: "11px", fontWeight: 500, borderRadius: "6px", padding: "2px 8px" },
    mesaIconeWrap: { display: "flex", alignItems: "center", gap: "8px" },
    mesaIcone: { fontSize: "22px" },
    mesaLugares: { fontSize: "13px", color: "#666" },

    // Form
    formWrap: { maxWidth: "460px", margin: "0 auto" },
    voltarBtn: {
        fontSize: "13px", color: "#888", background: "none", border: "none",
        cursor: "pointer", padding: "0 0 1.25rem", display: "block",
    },
    formCard: {
        background: "#FFF", border: "1px solid #EBEBEB",
        borderRadius: "20px", padding: "2rem",
        boxShadow: "0 4px 40px rgba(0,0,0,0.05)",
    },
    formHeader: { marginBottom: "1.75rem" },
    formBadgeGrande: {
        display: "inline-block",
        background: "#F5C518", color: "#111",
        fontWeight: 700, fontSize: "15px",
        borderRadius: "10px", padding: "6px 16px",
        marginBottom: "6px",
    },
    formSubtitle: { fontSize: "13px", color: "#888", margin: 0 },
    form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
    fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "13px", fontWeight: 500, color: "#444" },
    input: {
        padding: "10px 14px", fontSize: "14px",
        border: "1.5px solid #E5E5E5", borderRadius: "10px",
        outline: "none", background: "#FAFAFA", color: "#111",
        transition: "border-color 0.15s, box-shadow 0.15s",
        width: "100%", boxSizing: "border-box",
        fontFamily: "inherit",
    },
    horariosGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
    },
    horarioBtn: {
        padding: "9px 0", fontSize: "13px", fontWeight: 500,
        background: "#FAFAFA", border: "1.5px solid #E5E5E5",
        borderRadius: "8px", cursor: "pointer", color: "#444",
        transition: "all 0.12s",
    },
    horarioBtnAtivo: {
        background: "#F5C518", borderColor: "#F5C518", color: "#111",
    },
    msgErro: {
        background: "#FFF5F5", borderRadius: "8px", border: "1px solid #FC8181",
        color: "#9B2C2C", fontSize: "13px", fontWeight: 500,
        padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px",
    },
    submitBtn: {
        padding: "12px", background: "#F5C518", color: "#111",
        border: "none", borderRadius: "10px", fontSize: "15px",
        fontWeight: 600, width: "100%", cursor: "pointer",
        transition: "background 0.15s", letterSpacing: "0.01em",
    },

    // Confirmado
    confirmadoWrap: { maxWidth: "460px", margin: "0 auto" },
    confirmadoCard: {
        background: "#FFF", border: "1px solid #EBEBEB",
        borderRadius: "20px", padding: "2.5rem 2rem",
        boxShadow: "0 4px 40px rgba(0,0,0,0.05)",
        textAlign: "center",
    },
    confirmadoIcone: {
        width: "56px", height: "56px", background: "#F5C518",
        borderRadius: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "26px", fontWeight: 700,
        margin: "0 auto 1.25rem",
    },
    confirmadoTitulo: { fontSize: "20px", fontWeight: 700, color: "#111", margin: "0 0 6px", letterSpacing: "-0.3px" },
    confirmadoDesc: { fontSize: "14px", color: "#888", margin: "0 0 1.5rem" },
    confirmadoDetalhes: {
        background: "#F9F9F7", borderRadius: "12px",
        padding: "1rem 1.25rem", marginBottom: "1.5rem",
        display: "flex", flexDirection: "column", gap: "10px",
        textAlign: "left",
    },
    confirmadoLinha: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    confirmadoLabelDetalhe: { fontSize: "13px", color: "#888" },
    confirmadoValorDetalhe: { fontSize: "13px", fontWeight: 500, color: "#111" },
};