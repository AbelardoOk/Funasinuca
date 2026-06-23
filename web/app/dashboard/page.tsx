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
  statusPagamento: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  presencaConfirmada: boolean;
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

  const [loadingAcao, setLoadingAcao] = useState<string | null>(null);

  const [modalReagendar, setModalReagendar] = useState<{
    visivel: boolean;
    reservaId: string;
    data: string;
    horario: string;
  }>({
    visivel: false,
    reservaId: '',
    data: hojeISO(),
    horario: '',
  });

  // -----------------------------------------------------
  // AÇÕES MEMOIZADAS
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
  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    if (!isHydrated || !token) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    const processarRetorno = async () => {
      if (status === 'sucesso' && sessionId) {
        router.replace('/dashboard');
        try {
          await reservaService.verificarPagamento(sessionId, token);
          setAbaAtual('minhas');
          mostrarPopup('sucesso', 'Reserva confirmada!', 'O pagamento foi processado com sucesso.');
          await carregarMinhasReservas();
        } catch (err) {
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

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) return router.push('/login');

    userService
      .validate(token)
      .then((req) => {
        if (!req.ok) sair();
        else carregarMinhasReservas();
      })
      .catch(() => sair());
  }, [token, isHydrated, router, sair, carregarMinhasReservas]);

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
        setMsg('Não foi possível carregar as mesas. Tente novamente.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [reserva.data, reserva.horario, isHydrated, token]);

  // -----------------------------------------------------
  // HANDLERS DE AÇÕES (MINHAS RESERVAS)
  // -----------------------------------------------------

  const handlePagarAgora = async (id: string) => {
    setLoadingAcao(id);
    try {
      const resPagamento = await reservaService.criarPagamento(id, token);
      if (resPagamento.data?.checkoutUrl) {
        window.location.href = resPagamento.data.checkoutUrl;
      } else {
        mostrarPopup(
          'erro',
          'Falha ao gerar pagamento',
          'Não foi possível gerar o link do Stripe.',
        );
      }
    } catch (err) {
      mostrarPopup('erro', 'Erro', 'Instabilidade ao conectar com o gateway de pagamento.');
    } finally {
      setLoadingAcao(null);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    setLoadingAcao(id);
    try {
      const res = await reservaService.cancelar(id, token);
      if (res.ok) {
        mostrarPopup('sucesso', 'Reserva Cancelada', 'Sua mesa foi liberada com sucesso.');
        carregarMinhasReservas();
      } else {
        mostrarPopup(
          'erro',
          'Não foi possível cancelar',
          res.error || 'Tente novamente mais tarde.',
        );
      }
    } catch (err) {
      mostrarPopup('erro', 'Erro', 'Falha de comunicação com o servidor.');
    } finally {
      setLoadingAcao(null);
    }
  };

  const handleConfirmarReagendamento = async () => {
    if (!modalReagendar.data || !modalReagendar.horario) return;
    setLoading(true);
    try {
      const horarioInicio = `${modalReagendar.data}T${modalReagendar.horario}:00.000Z`;
      const res = await reservaService.update(modalReagendar.reservaId, { horarioInicio }, token);

      if (res.ok) {
        mostrarPopup('sucesso', 'Horário alterado!', 'Sua reserva foi atualizada com sucesso.');
        setModalReagendar({ visivel: false, reservaId: '', data: '', horario: '' });
        carregarMinhasReservas();
      } else {
        mostrarPopup(
          'erro',
          'Não foi possível alterar',
          res.error || 'Talvez este horário já esteja ocupado.',
        );
      }
    } catch (err) {
      mostrarPopup('erro', 'Erro', 'Falha ao atualizar a reserva.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // HANDLERS (NOVA RESERVA)
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
      setMsg('Houve um erro no processo. Acesse "Minhas Reservas" ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || !token) return null;

  return (
    <main style={s.page}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <ToastPopup popup={popup} />
      <Navbar onSair={sair} />

      <div style={s.content}>
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

        {abaAtual === 'nova' && (
          <div style={{ position: 'relative', paddingBottom: mesaSelecionada ? '100px' : '0' }}>
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
                      setMesaSelecionada(null);
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
                          setMesaSelecionada(null);
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

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

        {abaAtual === 'minhas' && (
          <div>
            <div style={s.pageHeader}>
              <h2 style={s.pageTitle}>Minhas Reservas</h2>
              <p style={s.pageDesc}>Acompanhe e gerencie o status das suas mesas agendadas</p>
            </div>

            {minhasReservas.length === 0 ? (
              <div style={s.emptyState}>Você ainda não possui reservas cadastradas.</div>
            ) : (
              <div style={s.reservaList}>
                {minhasReservas.map((reservaItem) => {
                  const dataReserva = new Date(reservaItem.horarioInicio);
                  const jaPassou = dataReserva < new Date();
                  const isPago = reservaItem.statusPagamento === 'PAGO';
                  const isCancelado = reservaItem.statusPagamento === 'CANCELADO';
                  const isProcessando = loadingAcao === reservaItem.id;

                  return (
                    <div
                      key={reservaItem.id}
                      style={{
                        ...s.reservaCard,
                        ...(jaPassou || isCancelado ? s.reservaCardInativo : {}),
                      }}
                    >
                      <div style={s.reservaCardInfo}>
                        <div>
                          <h3
                            style={{
                              ...s.reservaCardTitle,
                              color: jaPassou || isCancelado ? '#888' : '#111',
                            }}
                          >
                            Mesa {reservaItem.mesa.numero}
                          </h3>
                          <p style={s.reservaCardDate}>
                            {formatarDataHora(reservaItem.horarioInicio)}
                          </p>
                        </div>

                        <div style={s.badgesContainer}>
                          {isCancelado && <span style={s.badgeCancelado}>Cancelada</span>}
                          {jaPassou && !isCancelado && <span style={s.badgePassou}>Já passou</span>}
                          {reservaItem.presencaConfirmada && (
                            <span style={s.badgeCheckin}>Presença Confirmada</span>
                          )}

                          {!isCancelado && !reservaItem.presencaConfirmada && (
                            <span
                              style={{
                                ...s.mesaBadge,
                                background: isPago ? '#F0FFF4' : '#FFFBEA',
                                color: isPago ? '#276749' : '#7B5E00',
                                border: `1px solid ${isPago ? '#48BB78' : '#F5C518'}`,
                                opacity: jaPassou ? 0.6 : 1,
                              }}
                            >
                              {isPago ? 'Aprovado' : 'Pagamento Pendente'}
                            </span>
                          )}
                        </div>
                      </div>

                      {!jaPassou && !isCancelado && (
                        <div style={s.reservaAcoes}>
                          {!isPago && (
                            <button
                              style={{ ...s.btnAcao, ...s.btnPagar }}
                              onClick={() => handlePagarAgora(reservaItem.id)}
                              disabled={isProcessando}
                            >
                              {isProcessando ? '...' : '💳 Pagar'}
                            </button>
                          )}

                          <button
                            style={{ ...s.btnAcao, ...s.btnReagendar }}
                            onClick={() =>
                              setModalReagendar({
                                visivel: true,
                                reservaId: reservaItem.id,
                                data: reservaItem.horarioInicio.split('T')[0],
                                horario: '',
                              })
                            }
                            disabled={isProcessando || reservaItem.presencaConfirmada}
                          >
                            ✏️ Reagendar
                          </button>

                          <button
                            style={{ ...s.btnAcao, ...s.btnCancelar }}
                            onClick={() => handleCancelar(reservaItem.id)}
                            disabled={isProcessando || reservaItem.presencaConfirmada}
                          >
                            ✖ Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {modalReagendar.visivel && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h3 style={s.modalTitle}>Alterar Horário</h3>
            <p style={s.modalDesc}>Escolha uma nova data e horário para sua reserva.</p>

            <div style={s.bookingForm}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nova Data</label>
                <input
                  type="date"
                  min={hojeISO()}
                  value={modalReagendar.data}
                  onChange={(e) => setModalReagendar((prev) => ({ ...prev, data: e.target.value }))}
                  style={s.inputDate}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Novo Horário</label>
                <div style={s.horariosGridRow}>
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      style={{
                        ...s.horarioPill,
                        ...(modalReagendar.horario === h ? s.horarioPillAtivo : {}),
                      }}
                      onClick={() => setModalReagendar((prev) => ({ ...prev, horario: h }))}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={s.modalActions}>
              <button
                style={s.btnModalCancelar}
                onClick={() =>
                  setModalReagendar({ visivel: false, reservaId: '', data: '', horario: '' })
                }
                disabled={loading}
              >
                Voltar
              </button>
              <button
                style={{ ...s.submitBtn, opacity: !modalReagendar.horario || loading ? 0.5 : 1 }}
                onClick={handleConfirmarReagendamento}
                disabled={!modalReagendar.horario || loading}
              >
                {loading ? 'Salvando...' : 'Confirmar Novo Horário'}
              </button>
            </div>
          </div>
        </div>
      )}
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

  reservaList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  reservaCard: {
    background: '#FFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reservaCardInativo: { background: '#FAFAFA', borderColor: '#F0F0F0' },
  reservaCardInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
  },
  reservaCardTitle: { fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 4px 0' },
  reservaCardDate: { fontSize: '13px', color: '#666', margin: 0 },
  badgesContainer: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  badgePassou: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#E5E5E5',
    color: '#666',
    borderRadius: '6px',
    padding: '4px 8px',
  },
  badgeCancelado: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#FFF5F5',
    color: '#C53030',
    borderRadius: '6px',
    padding: '4px 8px',
    border: '1px solid #FEB2B2',
  },
  badgeCheckin: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#E6FFFA',
    color: '#285E61',
    borderRadius: '6px',
    padding: '4px 8px',
    border: '1px solid #81E6D9',
  },

  reservaAcoes: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    borderTop: '1px solid #F0F0F0',
    paddingTop: '12px',
  },
  btnAcao: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s',
  },
  btnPagar: { background: '#111', color: '#FFF' },
  btnCheckin: { background: '#48BB78', color: '#FFF' },
  btnReagendar: { background: '#EDF2F7', color: '#4A5568' },
  btnCancelar: { background: '#FFF5F5', color: '#C53030' },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modalContent: {
    background: '#FFF',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' },
  modalDesc: { fontSize: '14px', color: '#666', margin: '0 0 24px 0' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnModalCancelar: {
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
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
