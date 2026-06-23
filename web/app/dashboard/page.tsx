'use client';

import { reservaService } from '@/lib/api/reservas';
import { userService } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

// ==========================================
// 1. TIPAGENS
// ==========================================
type Mesa = {
  id: string;
  numero: number;
  status: 'disponivel' | 'reservada' | 'ocupada';
};

type ReservaForm = {
  mesaId: string;
  data: string;
  horario: string;
};

type MinhaReserva = {
  id: string;
  horarioInicio: string;
  statusPagamento: string;
  mesa: { numero: number };
};

type PopupState = {
  visivel: boolean;
  tipo: 'sucesso' | 'erro';
  titulo: string;
  desc: string;
};

// ==========================================
// 2. CONSTANTES E UTILITÁRIOS
// ==========================================
const HORARIOS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00', '21:00'];

const STATUS_CONFIG = {
  disponivel: { label: 'Livre', dot: '#48BB78', bg: '#F0FFF4', text: '#276749' },
  reservada: { label: 'Reservada', dot: '#F5C518', bg: '#FFFBEA', text: '#7B5E00' },
  ocupada: { label: 'Ocupada', dot: '#FC8181', bg: '#FFF5F5', text: '#9B2C2C' },
};

const hojeISO = () => new Date().toISOString().split('T')[0];

const formatarDataHora = (isoString: string) => {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ==========================================
// 3. COMPONENTES MENORES (UI)
// ==========================================
const Navbar = ({ onSair }: { onSair: () => void }) => (
  <nav style={s.nav}>
    <div style={s.navBrand}>
      <div style={s.navLogo}>🎱</div>
      <span style={s.navTitle}>Funasinuca</span>
    </div>
    <button style={s.navBtn} onClick={onSair}>
      Sair
    </button>
  </nav>
);

const ToastPopup = ({ popup }: { popup: PopupState }) => {
  if (!popup.visivel) return null;
  return (
    <div
      style={{ ...s.popupContainer, ...(popup.tipo === 'sucesso' ? s.popupSucesso : s.popupErro) }}
    >
      <div style={s.popupIcone}>{popup.tipo === 'sucesso' ? '✅' : '❌'}</div>
      <div>
        <h4 style={s.popupTitulo}>{popup.titulo}</h4>
        <p style={s.popupDesc}>{popup.desc}</p>
      </div>
    </div>
  );
};

const CheckoutBar = ({
  mesa,
  reserva,
  msg,
  loading,
  onConfirm,
}: {
  mesa: Mesa;
  reserva: ReservaForm;
  msg: string;
  loading: boolean;
  onConfirm: () => void;
}) => (
  <div style={s.checkoutBar}>
    <div style={s.checkoutInfo}>
      <div style={s.checkoutTitle}>Mesa {mesa.numero}</div>
      <div style={s.checkoutSubtitle}>
        {reserva.data.split('-').reverse().join('/')} às {reserva.horario}
      </div>
    </div>
    <div style={s.checkoutActions}>
      {msg && <span style={s.msgErroFlutuante}>{msg}</span>}
      <button
        onClick={onConfirm}
        disabled={loading}
        style={{
          ...s.submitBtn,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processando...' : 'Confirmar e Pagar →'}
      </button>
    </div>
  </div>
);

// ==========================================
// 4. COMPONENTE PRINCIPAL (DASHBOARD)
// ==========================================
export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useLocalStorage('token', '');
  const [isHydrated, setIsHydrated] = useState(false);

  // Estados de Negócio
  const [abaAtual, setAbaAtual] = useState<'nova' | 'minhas'>('nova');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [minhasReservas, setMinhasReservas] = useState<MinhaReserva[]>([]);
  const [reserva, setReserva] = useState<ReservaForm>({ mesaId: '', data: hojeISO(), horario: '' });

  // Estados de UI/Feedback
  const [popup, setPopup] = useState<PopupState>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    desc: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [msg, setMsg] = useState('');

  // -----------------------------------------------------
  // AÇÕES MEMOIZADAS (Evitam recriação a cada render e erros do ESLint)
  // -----------------------------------------------------
  const mostrarPopup = useCallback((tipo: 'sucesso' | 'erro', titulo: string, desc: string) => {
    setPopup({ visivel: true, tipo, titulo, desc });
    setTimeout(() => setPopup((prev) => ({ ...prev, visivel: false })), 5000);
  }, []);

  const sair = useCallback(() => {
    setToken('');
    router.push('/login');
  }, [router, setToken]);

  const carregarMinhasReservas = useCallback(async () => {
    try {
      const res = await reservaService.getMinhas(token);
      if (res.data) setMinhasReservas(res.data as unknown as MinhaReserva[]);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    }
  }, [token]);

  // -----------------------------------------------------
  // EFEITOS
  // -----------------------------------------------------

  // Hidratação
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Efeito 1: Tratamento de Retorno de Pagamento (Stripe/Gateway)
  useEffect(() => {
    if (!isHydrated || !token) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    // Isolar num bloco assíncrono evita o erro de "setState in effect" do ESLint
    const processarRetorno = async () => {
      if (status === 'sucesso' && sessionId) {
        router.replace('/dashboard');
        try {
          await reservaService.verificarPagamento(sessionId, token);
          setAbaAtual('minhas');
          mostrarPopup(
            'sucesso',
            'Reserva confirmada!',
            'Veja os detalhes na aba de minhas reservas.',
          );
          await carregarMinhasReservas();
        } catch (err) {
          console.error(err);
          mostrarPopup(
            'erro',
            'Ops, não confirmou...',
            'Não identificamos o pagamento. Verifique suas reservas.',
          );
        }
      } else if (status === 'falha') {
        router.replace('/dashboard');
        mostrarPopup(
          'erro',
          'Pagamento cancelado',
          'Infelizmente seu pagamento não foi concluído.',
        );
      }
    };

    processarRetorno();
  }, [isHydrated, token, router, carregarMinhasReservas, mostrarPopup]);

  // Efeito 2: Validação de Usuário e Carga Inicial
  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      router.push('/login');
      return;
    }

    userService
      .validate(token)
      .then((req) => {
        if (!req.ok) sair();
        else carregarMinhasReservas();
      })
      .catch((err) => {
        console.error('Erro na validação do token:', err);
        sair();
      });
  }, [token, isHydrated, router, sair, carregarMinhasReservas]);

  // Efeito 3: Busca de Disponibilidade de Mesas
  useEffect(() => {
    if (!isHydrated || !token || !reserva.data || !reserva.horario) return;

    setIsSearching(true);
    setMsg('');

    const timeoutId = setTimeout(async () => {
      try {
        const horarioInicio = `${reserva.data}T${reserva.horario}:00.000Z`;
        const res = await reservaService.getDisponibilidade(horarioInicio, token);
        if (res.data) {
          setMesas(
            res.data.map((m) => ({
              id: m.id,
              numero: m.numero,
              status: m.disponivel ? 'disponivel' : 'ocupada',
            })),
          );
        }
      } catch (err) {
        console.error('Erro ao buscar mesas:', err);
        setMsg('Não foi possível carregar as mesas. Tente novamente.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [reserva.data, reserva.horario, isHydrated, token]);

  // -----------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------
  const selecionarMesa = (mesa: Mesa) => {
    if (mesa.status !== 'disponivel') return;
    setMesaSelecionada(mesa);
    setReserva((prev) => ({ ...prev, mesaId: mesa.id }));
    setMsg('');
  };

  const confirmarReserva = async () => {
    if (!reserva.horario || !reserva.mesaId || !mesaSelecionada) return;
    setLoading(true);
    setMsg('');

    try {
      const horarioInicio = `${reserva.data}T${reserva.horario}:00.000Z`;
      const resReserva = await reservaService.create(
        { mesaId: reserva.mesaId, horarioInicio },
        token,
      );

      if (!resReserva.data?.id) throw new Error('Falha ao criar reserva');

      const resPagamento = await reservaService.criarPagamento(String(resReserva.data.id), token);

      if (resPagamento.data?.checkoutUrl) {
        window.location.href = resPagamento.data.checkoutUrl;
      } else {
        setMsg('Acesse "Minhas Reservas" para tentar pagar novamente.');
      }
    } catch (err) {
      console.error('Falha no processo de reserva/pagamento:', err);
      setMsg('Houve um erro no processo. Acesse "Minhas Reservas" ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Prevenção de Hydration Mismatch
  if (!isHydrated || !token) return null;

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <main style={s.page}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <ToastPopup popup={popup} />
      <Navbar onSair={sair} />

      <div style={s.content}>
        {/* Navegação por Abas */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tabBtn, ...(abaAtual === 'nova' ? s.tabBtnAtivo : {}) }}
            onClick={() => {
              setAbaAtual('nova');
              setMesaSelecionada(null);
            }}
          >
            Nova Reserva
          </button>
          <button
            style={{ ...s.tabBtn, ...(abaAtual === 'minhas' ? s.tabBtnAtivo : {}) }}
            onClick={() => setAbaAtual('minhas')}
          >
            Minhas Reservas
          </button>
        </div>

        {/* ABA: NOVA RESERVA */}
        {abaAtual === 'nova' && (
          <div style={{ position: 'relative', paddingBottom: mesaSelecionada ? '100px' : '0' }}>
            {/* Filtros */}
            <div style={s.bookingCard}>
              <h2 style={s.bookingTitle}>Quando você quer jogar?</h2>
              <div style={s.bookingForm}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Data da reserva</label>
                  <input
                    type="date"
                    required
                    min={hojeISO()}
                    value={reserva.data}
                    onChange={(e) => {
                      setReserva((prev) => ({ ...prev, data: e.target.value }));
                      setMesaSelecionada(null); // Limpa a mesa selecionada se a data mudar
                    }}
                    style={s.inputDate}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Horário</label>
                  <div style={s.horariosGridRow}>
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        style={{
                          ...s.horarioPill,
                          ...(reserva.horario === h ? s.horarioPillAtivo : {}),
                        }}
                        onClick={() => {
                          setReserva((prev) => ({ ...prev, horario: h }));
                          setMesaSelecionada(null); // Limpa a mesa selecionada se a hora mudar
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Mesas */}
            <div style={s.mesasSection}>
              {!reserva.horario ? (
                <div style={s.emptyState}>
                  Escolha um horário acima para ver quais mesas estão livres.
                </div>
              ) : isSearching ? (
                <div style={s.emptyState}>
                  <span style={s.loader}>Buscando disponibilidade...</span>
                </div>
              ) : (
                <>
                  <div style={s.legenda}>
                    <h3 style={s.mesasTitle}>Mesas Disponíveis</h3>
                    <div style={s.legendaWrapper}>
                      {(['disponivel', 'ocupada'] as const).map((st) => (
                        <div key={st} style={s.legendaItem}>
                          <div style={{ ...s.legendaDot, background: STATUS_CONFIG[st].dot }} />
                          <span style={s.legendaLabel}>{STATUS_CONFIG[st].label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={s.grid}>
                    {mesas.map((mesa) => (
                      <button
                        key={mesa.id}
                        style={{
                          ...s.mesaCard,
                          ...(mesa.status !== 'disponivel' ? s.mesaCardDesabilitada : {}),
                          ...(mesaSelecionada?.id === mesa.id ? s.mesaCardSelecionada : {}),
                        }}
                        onClick={() => selecionarMesa(mesa)}
                        disabled={mesa.status !== 'disponivel'}
                      >
                        <div style={s.mesaTop}>
                          <span style={s.mesaNumero}>Mesa {mesa.numero}</span>
                          <span
                            style={{
                              ...s.mesaBadge,
                              background: STATUS_CONFIG[mesa.status].bg,
                              color: STATUS_CONFIG[mesa.status].text,
                            }}
                          >
                            {STATUS_CONFIG[mesa.status].label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Checkout Footer */}
            {mesaSelecionada && (
              <CheckoutBar
                mesa={mesaSelecionada}
                reserva={reserva}
                msg={msg}
                loading={loading}
                onConfirm={confirmarReserva}
              />
            )}
          </div>
        )}

        {/* ABA: MINHAS RESERVAS */}
        {abaAtual === 'minhas' && (
          <div>
            <div style={s.pageHeader}>
              <h2 style={s.pageTitle}>Minhas Reservas</h2>
              <p style={s.pageDesc}>Acompanhe o status das suas mesas agendadas</p>
            </div>

            {minhasReservas.length === 0 ? (
              <div style={s.emptyState}>Você ainda não possui reservas cadastradas.</div>
            ) : (
              <div style={s.reservaList}>
                {minhasReservas.map((reservaItem) => {
                  const jaPassou = new Date(reservaItem.horarioInicio) < new Date();
                  const isPago = reservaItem.statusPagamento === 'PAGO';

                  return (
                    <div
                      key={reservaItem.id}
                      style={{ ...s.reservaCard, ...(jaPassou ? s.reservaCardPassou : {}) }}
                    >
                      <div>
                        <h3 style={{ ...s.reservaCardTitle, color: jaPassou ? '#888' : '#111' }}>
                          Mesa {reservaItem.mesa.numero}
                        </h3>
                        <p style={s.reservaCardDate}>
                          {formatarDataHora(reservaItem.horarioInicio)}
                        </p>
                      </div>
                      <div style={s.badgesContainer}>
                        {jaPassou && <span style={s.badgePassou}>Já passou</span>}
                        <span
                          style={{
                            ...s.mesaBadge,
                            background: isPago ? '#F0FFF4' : '#FFFBEA',
                            color: isPago ? '#276749' : '#7B5E00',
                            border: `1px solid ${isPago ? '#48BB78' : '#F5C518'}`,
                            opacity: jaPassou ? 0.6 : 1,
                          }}
                        >
                          {isPago ? 'Aprovado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ==========================================
// 5. ESTILOS
// ==========================================
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F9F9F7',
    fontFamily: "'Geist', 'DM Sans', 'Inter', sans-serif",
  },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: '#FFFFFF',
    borderBottom: '1px solid #EBEBEB',
    padding: '0 1.5rem',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo: {
    width: '34px',
    height: '34px',
    background: '#F5C518',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  navTitle: { fontSize: '16px', fontWeight: 700, color: '#111111', letterSpacing: '-0.3px' },
  navBtn: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#888',
    background: 'none',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
  },
  content: { maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' },
  tabs: { display: 'flex', gap: '1.5rem', borderBottom: '1px solid #EBEBEB', marginBottom: '2rem' },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0 0 10px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#888',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabBtnAtivo: { color: '#111', borderBottomColor: '#F5C518' },
  pageHeader: { marginBottom: '1.25rem' },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 4px',
    letterSpacing: '-0.4px',
  },
  pageDesc: { fontSize: '14px', color: '#888', margin: 0 },
  bookingCard: {
    background: '#FFF',
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    marginBottom: '2rem',
  },
  bookingTitle: { fontSize: '16px', fontWeight: 600, color: '#111', margin: '0 0 1.25rem 0' },
  bookingForm: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#666' },
  inputDate: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '1.5px solid #E5E5E5',
    borderRadius: '10px',
    outline: 'none',
    background: '#FAFAFA',
    color: '#111',
    width: '100%',
    maxWidth: '240px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  horariosGridRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  horarioPill: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    background: '#FFF',
    border: '1.5px solid #E5E5E5',
    borderRadius: '100px',
    cursor: 'pointer',
    color: '#444',
    transition: 'all 0.15s',
  },
  horarioPillAtivo: {
    background: '#F5C518',
    borderColor: '#F5C518',
    color: '#111',
    fontWeight: 600,
  },
  mesasSection: { marginTop: '1rem' },
  mesasTitle: { fontSize: '16px', fontWeight: 600, color: '#111', margin: 0 },
  legenda: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  legendaWrapper: { display: 'flex', gap: '1rem' },
  legendaItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendaDot: { width: '8px', height: '8px', borderRadius: '50%' },
  legendaLabel: { fontSize: '12px', color: '#666' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  mesaCard: {
    background: '#FFF',
    border: '1.5px solid #EBEBEB',
    borderRadius: '14px',
    padding: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
  },
  mesaCardDesabilitada: { opacity: 0.55, cursor: 'not-allowed', background: '#FAFAFA' },
  mesaCardSelecionada: { borderColor: '#F5C518', boxShadow: '0 0 0 3px rgba(245,197,24,0.2)' },
  mesaTop: { display: 'flex', flexDirection: 'column', gap: '8px' },
  mesaNumero: { fontSize: '15px', fontWeight: 600, color: '#111' },
  mesaBadge: {
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '6px',
    padding: '4px 8px',
    alignSelf: 'flex-start',
  },
  checkoutBar: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 3rem)',
    maxWidth: '600px',
    background: '#111',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
    zIndex: 100,
    flexWrap: 'wrap',
    gap: '12px',
  },
  checkoutInfo: { display: 'flex', flexDirection: 'column' },
  checkoutTitle: { color: '#FFF', fontSize: '16px', fontWeight: 600 },
  checkoutSubtitle: { color: '#AAA', fontSize: '13px' },
  checkoutActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    justifyContent: 'flex-end',
  },
  msgErroFlutuante: { color: '#FC8181', fontSize: '12px' },
  submitBtn: {
    padding: '10px 20px',
    background: '#F5C518',
    color: '#111',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#888',
    background: '#FFF',
    borderRadius: '14px',
    border: '1px dashed #E5E5E5',
    fontSize: '14px',
  },
  loader: { color: '#111', fontWeight: 500 },
  reservaList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reservaCard: {
    background: '#FFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reservaCardPassou: { background: '#FAFAFA', borderColor: '#F0F0F0' },
  reservaCardTitle: { fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 4px 0' },
  reservaCardDate: { fontSize: '13px', color: '#666', margin: 0 },
  badgesContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  badgePassou: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#E5E5E5',
    color: '#666',
    borderRadius: '6px',
    padding: '4px 8px',
  },
  popupContainer: {
    position: 'fixed',
    top: '80px',
    right: '24px',
    zIndex: 9999,
    padding: '16px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    maxWidth: '360px',
    animation: 'slideInRight 0.3s ease-out forwards',
  },
  popupSucesso: { background: '#FFF', borderLeft: '4px solid #48BB78' },
  popupErro: { background: '#FFF', borderLeft: '4px solid #FC8181' },
  popupIcone: { fontSize: '20px', lineHeight: 1 },
  popupTitulo: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#111' },
  popupDesc: { margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.4 },
};
