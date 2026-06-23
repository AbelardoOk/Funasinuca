'use client';

import { mesaService } from '@/lib/api/mesas';
import { reservaService } from '@/lib/api/reservas';
import { userService } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

type Mesa = {
  id: string;
  numero: number;
  status: 'disponivel' | 'reservada' | 'ocupada';
};

// Renomeado para evitar conflito com o retorno da API
type ReservaForm = {
  mesaId: string;
  data: string;
  horario: string;
};

// Novo tipo com base no retorno do Prisma (getMinhasReservas.ts)
type MinhaReserva = {
  id: string;
  horarioInicio: string;
  statusPagamento: string;
  mesa: {
    numero: number;
  };
};

const HORARIOS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00', '21:00'];

function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function formatarDataHora(isoString: string) {
  const data = new Date(isoString);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const [token, setToken] = useLocalStorage('token', '');
  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false);

  // Controle de abas
  const [abaAtual, setAbaAtual] = useState<'nova' | 'minhas'>('nova');

  // Estados de Mesas e Nova Reserva
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [etapa, setEtapa] = useState<'lista' | 'formulario'>('lista');
  const [reserva, setReserva] = useState<ReservaForm>({
    mesaId: '',
    data: hojeISO(),
    horario: '',
  });
  const [filtro, setFiltro] = useState<'todas' | 'disponivel'>('disponivel');

  // Estados de Minhas Reservas
  const [minhasReservas, setMinhasReservas] = useState<MinhaReserva[]>([]);

  // Estados Globais
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    async function carregarDados() {
      try {
        // 1. Valida o usuário
        const req = await userService.validate(token);
        if (!req.ok) {
          setToken('');
          router.push('/login');
          return;
        }

        // 2. Busca mesas
        const resMesas = await mesaService.getAll(token);
        if (resMesas.data) {
          const statusMap: Record<string, Mesa['status']> = {
            DISPONIVEL: 'disponivel',
            RESERVADA: 'reservada',
            INDISPONIVEL: 'ocupada',
          };
          setMesas(
            resMesas.data.map((m) => ({
              id: m.id,
              numero: m.numero,
              status: statusMap[m.status] ?? 'ocupada',
            })),
          );
        }

        // 3. Busca reservas do usuário
        const resMinhas = await reservaService.getMinhas(token);
        if (resMinhas.data) {
          // O cast é feito aqui porque a tipagem da API original pode estar genérica
          setMinhasReservas(resMinhas.data as unknown as MinhaReserva[]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setToken('');
        router.push('/login');
      }
    }

    carregarDados();
  }, [token, isHydrated, router, setToken]);

  function sair() {
    setToken('');
    router.push('/login');
  }

  function selecionarMesa(mesa: Mesa) {
    if (mesa.status !== 'disponivel') return;
    setMesaSelecionada(mesa);
    setReserva((prev) => ({ ...prev, mesaId: mesa.id }));
    setEtapa('formulario');
    setMsg('');
  }

  async function confirmarReserva(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reserva.horario) {
      setMsg('Selecione um horário.');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const horarioInicio = `${reserva.data}T${reserva.horario}:00.000Z`;

      const resReserva = await reservaService.create(
        {
          mesaId: reserva.mesaId,
          horarioInicio,
        },
        token,
      );

      if (!resReserva.data) {
        setMsg('Erro ao criar reserva. Tente novamente.');
        setLoading(false);
        return;
      }

      const resPagamento = await reservaService.criarPagamento(String(resReserva.data.id), token);

      if (resPagamento.data?.sandboxInitPoint) {
        window.location.href = resPagamento.data.sandboxInitPoint;
        return;
      }

      // Fallback
      const dataFormatada = new Date(reserva.data + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const params = new URLSearchParams({
        mesaId: String(reserva.mesaId),
        mesa: String(mesaSelecionada!.numero),
        data: dataFormatada,
        horario: reserva.horario,
      });

      router.push(`/pagamento?${params.toString()}`);
    } catch {
      setMsg('Erro ao realizar reserva. Tente novamente.');
      setLoading(false);
    }
  }

  function voltarParaLista() {
    setMesaSelecionada(null);
    setReserva({ mesaId: '', data: hojeISO(), horario: '' });
    setEtapa('lista');
    setMsg('');
  }

  if (!isHydrated || !token) {
    return null;
  }

  const mesasFiltradas =
    filtro === 'todas' ? mesas : mesas.filter((m) => m.status === 'disponivel');

  return (
    <main style={s.page}>
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <div style={s.navLogo}>🎱</div>
          <span style={s.navTitle}>Funasinuca</span>
        </div>
        <button style={s.navBtn} onClick={sair}>
          Sair
        </button>
      </nav>

      <div style={s.content}>
        {/* ── Navegação de Abas ── */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tabBtn, ...(abaAtual === 'nova' ? s.tabBtnAtivo : {}) }}
            onClick={() => {
              setAbaAtual('nova');
              voltarParaLista();
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

        {/* ── ABA: Nova Reserva ── */}
        {abaAtual === 'nova' && (
          <>
            {etapa === 'lista' && (
              <>
                <div style={s.pageHeader}>
                  <div>
                    <h2 style={s.pageTitle}>Reservar mesa</h2>
                    <p style={s.pageDesc}>Escolha uma mesa disponível para continuar</p>
                  </div>
                  <div style={s.filtros}>
                    <button
                      style={{
                        ...s.filtroBtn,
                        ...(filtro === 'disponivel' ? s.filtroBtnAtivo : {}),
                      }}
                      onClick={() => setFiltro('disponivel')}
                    >
                      Disponíveis
                    </button>
                    <button
                      style={{ ...s.filtroBtn, ...(filtro === 'todas' ? s.filtroBtnAtivo : {}) }}
                      onClick={() => setFiltro('todas')}
                    >
                      Todas
                    </button>
                  </div>
                </div>

                <div style={s.legenda}>
                  {(['disponivel', 'reservada', 'ocupada'] as const).map((st) => (
                    <div key={st} style={s.legendaItem}>
                      <div style={{ ...s.legendaDot, background: statusColor[st].dot }} />
                      <span style={s.legendaLabel}>{statusLabel[st]}</span>
                    </div>
                  ))}
                </div>

                <div style={s.grid}>
                  {mesasFiltradas.map((mesa) => (
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
                            background: statusColor[mesa.status].bg,
                            color: statusColor[mesa.status].text,
                          }}
                        >
                          {statusLabel[mesa.status]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {etapa === 'formulario' && mesaSelecionada && (
              <div style={s.formWrap}>
                <button style={s.voltarBtn} onClick={voltarParaLista}>
                  ← Voltar
                </button>

                <div style={s.formCard}>
                  <div style={s.formHeader}>
                    <div style={s.formBadgeGrande}>Mesa {mesaSelecionada.numero}</div>
                  </div>

                  <form onSubmit={confirmarReserva} style={s.form}>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Data</label>
                      <input
                        type="date"
                        required
                        min={hojeISO()}
                        value={reserva.data}
                        onChange={(e) => setReserva((prev) => ({ ...prev, data: e.target.value }))}
                        style={s.input}
                      />
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.label}>Horário</label>
                      <div style={s.horariosGrid}>
                        {HORARIOS.map((h) => (
                          <button
                            key={h}
                            type="button"
                            style={{
                              ...s.horarioBtn,
                              ...(reserva.horario === h ? s.horarioBtnAtivo : {}),
                            }}
                            onClick={() => setReserva((prev) => ({ ...prev, horario: h }))}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>

                    {msg && (
                      <div style={s.msgErro}>
                        <span>✕</span> {msg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...s.submitBtn,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'Confirmando...' : 'Ir para pagamento →'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ABA: Minhas Reservas ── */}
        {abaAtual === 'minhas' && (
          <div>
            <div style={s.pageHeader}>
              <div>
                <h2 style={s.pageTitle}>Minhas Reservas</h2>
                <p style={s.pageDesc}>Acompanhe o status das suas mesas agendadas</p>
              </div>
            </div>

            {minhasReservas.length === 0 ? (
              <div style={s.emptyState}>Você ainda não possui reservas cadastradas.</div>
            ) : (
              <div style={s.reservaList}>
                {minhasReservas.map((reservaItem) => {
                  const jaPassou = new Date(reservaItem.horarioInicio) < new Date();

                  return (
                    <div
                      key={reservaItem.id}
                      style={{
                        ...s.reservaCard,
                        ...(jaPassou ? s.reservaCardPassou : {}),
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            ...s.reservaCardTitle,
                            color: jaPassou ? '#888' : '#111',
                          }}
                        >
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
                            background:
                              reservaItem.statusPagamento === 'PAGO' ? '#F0FFF4' : '#FFFBEA',
                            color: reservaItem.statusPagamento === 'PAGO' ? '#276749' : '#7B5E00',
                            border: `1px solid ${reservaItem.statusPagamento === 'PAGO' ? '#48BB78' : '#F5C518'}`,
                            opacity: jaPassou ? 0.6 : 1, // Deixa a badge de pagamento mais transparente se já passou
                          }}
                        >
                          {reservaItem.statusPagamento === 'PAGO' ? 'Aprovado' : 'Pendente'}
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

const statusLabel = { disponivel: 'Disponível', reservada: 'Reservada', ocupada: 'Ocupada' };
const statusColor = {
  disponivel: { dot: '#48BB78', bg: '#F0FFF4', text: '#276749' },
  reservada: { dot: '#F5C518', bg: '#FFFBEA', text: '#7B5E00' },
  ocupada: { dot: '#FC8181', bg: '#FFF5F5', text: '#9B2C2C' },
};

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
  content: { maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' },

  // Tabs
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

  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 4px',
    letterSpacing: '-0.4px',
  },
  pageDesc: { fontSize: '14px', color: '#888', margin: 0 },
  filtros: { display: 'flex', gap: '6px' },
  filtroBtn: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#888',
    background: '#FFF',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '7px 16px',
    cursor: 'pointer',
  },
  filtroBtnAtivo: { background: '#111', color: '#FFF', borderColor: '#111' },
  legenda: { display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' },
  legendaItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendaDot: { width: '8px', height: '8px', borderRadius: '50%' },
  legendaLabel: { fontSize: '12px', color: '#666' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  mesaCard: {
    background: '#FFF',
    border: '1.5px solid #EBEBEB',
    borderRadius: '14px',
    padding: '1rem 1rem 0.9rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  mesaCardDesabilitada: { opacity: 0.55, cursor: 'not-allowed', background: '#FAFAFA' },
  mesaCardSelecionada: { borderColor: '#F5C518', boxShadow: '0 0 0 3px rgba(245,197,24,0.2)' },
  mesaTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mesaNumero: { fontSize: '14px', fontWeight: 600, color: '#111' },
  mesaBadge: { fontSize: '11px', fontWeight: 600, borderRadius: '6px', padding: '4px 8px' },
  formWrap: { maxWidth: '460px', margin: '0 auto' },
  voltarBtn: {
    fontSize: '13px',
    color: '#888',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 0 1.25rem',
    display: 'block',
  },
  formCard: {
    background: '#FFF',
    border: '1px solid #EBEBEB',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 4px 40px rgba(0,0,0,0.05)',
  },
  formHeader: { marginBottom: '1.75rem' },
  formBadgeGrande: {
    display: 'inline-block',
    background: '#F5C518',
    color: '#111',
    fontWeight: 700,
    fontSize: '15px',
    borderRadius: '10px',
    padding: '6px 16px',
    marginBottom: '6px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#444' },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1.5px solid #E5E5E5',
    borderRadius: '10px',
    outline: 'none',
    background: '#FAFAFA',
    color: '#111',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  horariosGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  horarioBtn: {
    padding: '9px 0',
    fontSize: '13px',
    fontWeight: 500,
    background: '#FAFAFA',
    border: '1.5px solid #E5E5E5',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#444',
  },
  horarioBtnAtivo: { background: '#F5C518', borderColor: '#F5C518', color: '#111' },
  msgErro: {
    background: '#FFF5F5',
    borderRadius: '8px',
    border: '1px solid #FC8181',
    color: '#9B2C2C',
    fontSize: '13px',
    fontWeight: 500,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitBtn: {
    padding: '12px',
    background: '#F5C518',
    color: '#111',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    width: '100%',
    cursor: 'pointer',
  },

  // Listagem Minhas Reservas
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#888',
    background: '#FFF',
    borderRadius: '14px',
    border: '1px dashed #E5E5E5',
    fontSize: '14px',
  },
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
  reservaCardTitle: { fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 4px 0' },
  reservaCardDate: { fontSize: '13px', color: '#666', margin: 0 },
  reservaCardPassou: { background: '#FAFAFA', borderColor: '#F0F0F0' },
  badgesContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  badgePassou: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#F0F0F0',
    color: '#888',
    borderRadius: '6px',
    padding: '4px 8px',
    border: '1px solid #E5E5E5',
  },
};
