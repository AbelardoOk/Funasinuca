"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";

//  Tipos
type MetodoPagamento = "cartao" | "pix";

type DadosCartao = {
    numero: string;
    nome: string;
    validade: string;
    cvv: string;
};

//  Helpers 
function formatarCartao(valor: string) {
    return valor.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatarValidade(valor: string) {
    return valor.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
}
function mascararCartao(numero: string) {
    const limpo = numero.replace(/\s/g, "");
    return limpo.length >= 4 ? `•••• •••• •••• ${limpo.slice(-4)}` : "•••• •••• •••• ••••";
}

const VALOR_RESERVA = 30.0; // R$ — substituir pelo valor vindo da API

// Componente Principal 
export default function Pagamento() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token] = useLocalStorage("token", "");

    const mesa = searchParams.get("mesa") ?? "—";
    const data = searchParams.get("data") ?? "—";
    const horario = searchParams.get("horario") ?? "—";
    const nome = searchParams.get("nome") ?? "—";

    const [metodo, setMetodo] = useState<MetodoPagamento>("cartao");
    const [cartao, setCartao] = useState<DadosCartao>({ numero: "", nome: "", validade: "", cvv: "" });
    const [etapa, setEtapa] = useState<"form" | "processando" | "concluido">("form");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!token) router.push("/login");
    }, [token]);

    function handleCartaoChange(campo: keyof DadosCartao, valor: string) {
        let formatado = valor;
        if (campo === "numero") formatado = formatarCartao(valor);
        if (campo === "validade") formatado = formatarValidade(valor);
        if (campo === "cvv") formatado = valor.replace(/\D/g, "").slice(0, 3);
        setCartao(prev => ({ ...prev, [campo]: formatado }));
    }

    async function pagar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg("");

        if (metodo === "cartao") {
            if (cartao.numero.replace(/\s/g, "").length < 16) { setMsg("Número de cartão inválido."); return; }
            if (cartao.validade.length < 5) { setMsg("Validade inválida."); return; }
            if (cartao.cvv.length < 3) { setMsg("CVV inválido."); return; }
            if (!cartao.nome.trim()) { setMsg("Informe o nome impresso no cartão."); return; }
        }

        setEtapa("processando");

        try {
            // TODO: substituir pelo seu pagamentoService.processar({ metodo, cartao, token })
            await new Promise(res => setTimeout(res, 2000));
            setEtapa("concluido");
        } catch {
            setMsg("Falha no pagamento. Tente novamente.");
            setEtapa("form");
        }
    }

    return (
        <main style={s.page}>

            {/* Navbar */}
            <nav style={s.nav}>
                <div style={s.navBrand}>
                    <div style={s.navLogo}>🎱</div>
                    <span style={s.navTitle}>Funasinuca</span>
                </div>
                {etapa === "form" && (
                    <button style={s.navBtn} onClick={() => router.back()}>← Voltar</button>
                )}
            </nav>

            <div style={s.content}>

                {/* ── Formulário de Pagamento ── */}
                {etapa === "form" && (
                    <div style={s.layout}>

                        {/* Coluna esquerda — formulário */}
                        <div style={s.formCol}>
                            <h2 style={s.pageTitle}>Pagamento</h2>
                            <p style={s.pageDesc}>Finalize sua reserva</p>

                            {/* Seletor de método */}
                            <div style={s.metodosRow}>
                                {(["cartao", "pix"] as const).map(m => (
                                    <button
                                        key={m}
                                        style={{ ...s.metodoBtn, ...(metodo === m ? s.metodoBtnAtivo : {}) }}
                                        onClick={() => setMetodo(m)}
                                        type="button"
                                    >
                                        <span style={s.metodoIcone}>{m === "cartao" ? "💳" : "⚡"}</span>
                                        {m === "cartao" ? "Cartão" : "Pix"}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={pagar} style={s.form}>
                                {/* ── Cartão ── */}
                                {metodo === "cartao" && (
                                    <>
                                        {/* Preview do cartão */}
                                        <div style={s.cardPreview}>
                                            <div style={s.cardChip}>▪▪▪</div>
                                            <div style={s.cardNumero}>
                                                {mascararCartao(cartao.numero)}
                                            </div>
                                            <div style={s.cardBottom}>
                                                <div>
                                                    <div style={s.cardMiniLabel}>TITULAR</div>
                                                    <div style={s.cardMiniVal}>{cartao.nome || "SEU NOME"}</div>
                                                </div>
                                                <div>
                                                    <div style={s.cardMiniLabel}>VALIDADE</div>
                                                    <div style={s.cardMiniVal}>{cartao.validade || "MM/AA"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={s.fieldGroup}>
                                            <label style={s.label}>Número do cartão</label>
                                            <input style={s.input} value={cartao.numero} onChange={e => handleCartaoChange("numero", e.target.value)}
                                                placeholder="0000 0000 0000 0000" inputMode="numeric"
                                                onFocus={focusStyle} onBlur={blurStyle} />
                                        </div>
                                        <div style={s.fieldGroup}>
                                            <label style={s.label}>Nome impresso no cartão</label>
                                            <input style={s.input} value={cartao.nome} onChange={e => handleCartaoChange("nome", e.target.value.toUpperCase())}
                                                placeholder="NOME SOBRENOME"
                                                onFocus={focusStyle} onBlur={blurStyle} />
                                        </div>
                                        <div style={s.row2}>
                                            <div style={s.fieldGroup}>
                                                <label style={s.label}>Validade</label>
                                                <input style={s.input} value={cartao.validade} onChange={e => handleCartaoChange("validade", e.target.value)}
                                                    placeholder="MM/AA" inputMode="numeric"
                                                    onFocus={focusStyle} onBlur={blurStyle} />
                                            </div>
                                            <div style={s.fieldGroup}>
                                                <label style={s.label}>CVV</label>
                                                <input style={s.input} value={cartao.cvv} onChange={e => handleCartaoChange("cvv", e.target.value)}
                                                    placeholder="•••" inputMode="numeric" type="password"
                                                    onFocus={focusStyle} onBlur={blurStyle} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ── Pix ── */}
                                {metodo === "pix" && (
                                    <div style={s.pixBox}>
                                        <div style={s.pixQr}>
                                            <div style={s.pixQrInner}>
                                                {/* QR Code placeholder — substituir pelo QR real da API */}
                                                <span style={{ fontSize: "48px" }}>⚡</span>
                                                <span style={s.pixQrLabel}>QR Code Pix</span>
                                            </div>
                                        </div>
                                        <p style={s.pixDesc}>
                                            Escaneie o QR Code com o app do seu banco ou copie a chave abaixo.
                                        </p>
                                        <div style={s.pixChave}>
                                            <span style={s.pixChaveText}>funasinuca@pix.com.br</span>
                                            <button type="button" style={s.pixCopiarBtn}
                                                onClick={() => navigator.clipboard.writeText("funasinuca@pix.com.br")}>
                                                Copiar
                                            </button>
                                        </div>
                                        <p style={s.pixNote}>
                                            Após o pagamento, clique em <strong>"Confirmar pagamento"</strong> abaixo.
                                        </p>
                                    </div>
                                )}

                                {msg && <div style={s.msgErro}><span>✕</span> {msg}</div>}

                                <button type="submit" style={s.submitBtn}
                                    onMouseEnter={e => (e.target as HTMLButtonElement).style.background = "#E0B400"}
                                    onMouseLeave={e => (e.target as HTMLButtonElement).style.background = "#F5C518"}>
                                    {metodo === "cartao" ? `Pagar R$ ${VALOR_RESERVA.toFixed(2).replace(".", ",")}` : "Confirmar pagamento"}
                                </button>
                            </form>
                        </div>

                        {/* Coluna direita — resumo */}
                        <div style={s.resumoCol}>
                            <div style={s.resumoCard}>
                                <h3 style={s.resumoTitulo}>Resumo da reserva</h3>
                                <div style={s.resumoLinhas}>
                                    {[
                                        { label: "Mesa", valor: `Mesa ${mesa}` },
                                        { label: "Nome", valor: nome },
                                        { label: "Data", valor: data },
                                        { label: "Horário", valor: horario },
                                    ].map(item => (
                                        <div key={item.label} style={s.resumoLinha}>
                                            <span style={s.resumoLabel}>{item.label}</span>
                                            <span style={s.resumoValor}>{item.valor}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={s.resumoDivisor} />
                                <div style={s.resumoTotal}>
                                    <span style={s.resumoTotalLabel}>Total</span>
                                    <span style={s.resumoTotalValor}>R$ {VALOR_RESERVA.toFixed(2).replace(".", ",")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Processando ── */}
                {etapa === "processando" && (
                    <div style={s.centrado}>
                        <div style={s.spinnerGrande} />
                        <p style={s.processandoTexto}>Processando pagamento...</p>
                    </div>
                )}

                {/* ── Concluído ── */}
                {etapa === "concluido" && (
                    <div style={s.centrado}>
                        <div style={s.sucessoIcone}>✓</div>
                        <h2 style={s.sucessoTitulo}>Pagamento confirmado!</h2>
                        <p style={s.sucessoDesc}>Sua reserva está garantida. Nos vemos em breve!</p>
                        <div style={s.sucessoDetalhes}>
                            {[
                                { label: "Mesa", valor: `Mesa ${mesa}` },
                                { label: "Data", valor: data },
                                { label: "Horário", valor: horario },
                                { label: "Valor pago", valor: `R$ ${VALOR_RESERVA.toFixed(2).replace(".", ",")}` },
                            ].map(item => (
                                <div key={item.label} style={s.resumoLinha}>
                                    <span style={s.resumoLabel}>{item.label}</span>
                                    <span style={s.resumoValor}>{item.valor}</span>
                                </div>
                            ))}
                        </div>
                        <button style={s.submitBtn} onClick={() => router.push("/dashboard")}
                            onMouseEnter={e => (e.target as HTMLButtonElement).style.background = "#E0B400"}
                            onMouseLeave={e => (e.target as HTMLButtonElement).style.background = "#F5C518"}>
                            Voltar ao início
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}


function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#F5C518";
    e.target.style.boxShadow = "0 0 0 3px rgba(245,197,24,0.18)";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#E5E5E5";
    e.target.style.boxShadow = "none";
}


const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#F9F9F7", fontFamily: "'Geist','DM Sans','Inter',sans-serif" },

    nav: { background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "0 1.5rem", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    navBrand: { display: "flex", alignItems: "center", gap: "10px" },
    navLogo: { width: "34px", height: "34px", background: "#F5C518", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
    navTitle: { fontSize: "16px", fontWeight: 700, color: "#111", letterSpacing: "-0.3px" },
    navBtn: { fontSize: "13px", fontWeight: 500, color: "#888", background: "none", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "6px 14px", cursor: "pointer" },

    content: { maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" },

    layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" },
    formCol: {},
    resumoCol: { position: "sticky", top: "80px" },

    pageTitle: { fontSize: "22px", fontWeight: 700, color: "#111", margin: "0 0 4px", letterSpacing: "-0.4px" },
    pageDesc: { fontSize: "14px", color: "#888", margin: "0 0 1.75rem" },

    metodosRow: { display: "flex", gap: "10px", marginBottom: "1.5rem" },
    metodoBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#fff", border: "1.5px solid #E5E5E5", borderRadius: "10px", fontSize: "14px", fontWeight: 500, color: "#666", cursor: "pointer", transition: "all .15s" },
    metodoBtnAtivo: { borderColor: "#F5C518", background: "#FFFBEA", color: "#111", boxShadow: "0 0 0 2px rgba(245,197,24,.2)" },
    metodoIcone: { fontSize: "18px" },

    // Card preview
    cardPreview: { background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem", color: "#fff", position: "relative", overflow: "hidden" },
    cardChip: { fontSize: "12px", letterSpacing: "2px", color: "#F5C518", marginBottom: "1rem" },
    cardNumero: { fontSize: "18px", letterSpacing: "3px", fontWeight: 600, marginBottom: "1.25rem", fontFamily: "monospace" },
    cardBottom: { display: "flex", gap: "2rem" },
    cardMiniLabel: { fontSize: "10px", color: "#888", letterSpacing: "0.5px", marginBottom: "2px" },
    cardMiniVal: { fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px" },

    form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
    fieldGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    label: { fontSize: "13px", fontWeight: 500, color: "#444" },
    input: { padding: "10px 14px", fontSize: "14px", border: "1.5px solid #E5E5E5", borderRadius: "10px", outline: "none", background: "#FAFAFA", color: "#111", transition: "border-color .15s, box-shadow .15s", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },

    // Pix
    pixBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1rem 0" },
    pixQr: { width: "160px", height: "160px", border: "2px dashed #E5E5E5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
    pixQrInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
    pixQrLabel: { fontSize: "12px", color: "#999" },
    pixDesc: { fontSize: "14px", color: "#666", textAlign: "center", maxWidth: "320px" },
    pixChave: { display: "flex", alignItems: "center", gap: "10px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "10px", padding: "10px 14px", width: "100%", maxWidth: "340px" },
    pixChaveText: { fontSize: "13px", color: "#444", flex: 1 },
    pixCopiarBtn: { fontSize: "12px", fontWeight: 600, color: "#111", background: "#F5C518", border: "none", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" },
    pixNote: { fontSize: "12px", color: "#999", textAlign: "center" },

    msgErro: { background: "#FFF5F5", borderRadius: "8px", border: "1px solid #FC8181", color: "#9B2C2C", fontSize: "13px", fontWeight: 500, padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" },
    submitBtn: { padding: "13px", background: "#F5C518", color: "#111", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, width: "100%", cursor: "pointer", transition: "background .15s", letterSpacing: "0.01em", marginTop: "0.25rem" },

    // Resumo
    resumoCard: { background: "#fff", border: "1px solid #EBEBEB", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 20px rgba(0,0,0,.04)" },
    resumoTitulo: { fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 1rem", letterSpacing: "-0.2px" },
    resumoLinhas: { display: "flex", flexDirection: "column", gap: "10px" },
    resumoLinha: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    resumoLabel: { fontSize: "13px", color: "#888" },
    resumoValor: { fontSize: "13px", fontWeight: 500, color: "#111" },
    resumoDivisor: { height: "1px", background: "#F0F0F0", margin: "1rem 0" },
    resumoTotal: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    resumoTotalLabel: { fontSize: "15px", fontWeight: 700, color: "#111" },
    resumoTotalValor: { fontSize: "18px", fontWeight: 700, color: "#111" },

    // Processando / concluido
    centrado: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" },
    spinnerGrande: { width: "48px", height: "48px", border: "4px solid #F5C51844", borderTopColor: "#F5C518", borderRadius: "50%", animation: "spin .8s linear infinite" },
    processandoTexto: { fontSize: "16px", color: "#888" },
    sucessoIcone: { width: "68px", height: "68px", background: "#F5C518", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: 700, color: "#111" },
    sucessoTitulo: { fontSize: "22px", fontWeight: 700, color: "#111", letterSpacing: "-0.4px" },
    sucessoDesc: { fontSize: "14px", color: "#888" },
    sucessoDetalhes: { background: "#F9F9F7", borderRadius: "12px", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "400px", marginBottom: "0.5rem" },
};