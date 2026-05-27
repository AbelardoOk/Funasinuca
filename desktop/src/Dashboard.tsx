import { useEffect, useMemo, useState } from 'react';
import { CreateReservationModal } from './components/CreateReservationModal';
import { EditReservationModal } from './components/EditReservationModal';
import { MetricsBar } from './components/MetricsBar';
import './Dashboard.css';
import { reservasService } from './lib/api/endpoints/reservas';
import { ReservaData, UpdateReservaPayload } from './lib/api/types';

type TipoUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
  userRole: TipoUsuario;
}

export function Dashboard({ onLogout, userName, userRole }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modais controladores globais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMensagem, setErroMensagem] = useState('');

  const [selectedReserva, setSelectedReserva] = useState<ReservaData | null>(null);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [modalErro, setModalErro] = useState('');

  const carregarDadosDoBanco = async () => {
    setLoading(true);
    const response =
      userRole === 'CLIENTE'
        ? await reservasService.listarMinhas()
        : await reservasService.listarTodas();

    if (response.ok && response.data) {
      setReservas(response.data);
    } else {
      setErroMensagem(response.error || response.message || 'Erro ao carregar dados.');
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, [userRole]);

  const handleConfirmarPresenca = async () => {
    if (!selectedReserva) return;
    setModalActionLoading(true);
    const response = await reservasService.confirmarPresenca(selectedReserva.id);
    if (response.ok) {
      await carregarDadosDoBanco();
      setIsEditModalOpen(false);
    } else {
      setModalErro(response.message || 'Erro ao confirmar presença.');
    }
    setModalActionLoading(false);
  };

  const handleCancelarReserva = async () => {
    if (!selectedReserva) return;
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    setModalActionLoading(true);
    const response = await reservasService.cancelar(selectedReserva.id);
    if (response.ok) {
      await carregarDadosDoBanco();
      setIsEditModalOpen(false);
    } else {
      setModalErro(response.message || 'Erro ao cancelar reserva.');
    }
    setModalActionLoading(false);
  };

  const handleAtualizarReserva = async (payload: UpdateReservaPayload) => {
    if (!selectedReserva) return;
    setModalActionLoading(true);
    setModalErro('');

    const response = await reservasService.atualizar(selectedReserva.id, payload);
    if (response.ok) {
      await carregarDadosDoBanco();
      setIsEditModalOpen(false);
    } else {
      setModalErro(response.message || 'Erro ao salvar alterações.');
    }
    setModalActionLoading(false);
  };

  // Lógica de manipulação de datas estendida
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const hasReservation = (day: number) => {
    return reservas.some((r) => {
      const resDate = new Date(r.horarioInicio);
      return (
        resDate.getDate() === day &&
        resDate.getMonth() === currentDate.getMonth() &&
        resDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const reservasDoDia = useMemo(() => {
    return reservas.filter((r) => {
      const resDate = new Date(r.horarioInicio);
      return resDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, reservas]);

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: 'PENDENTE' | 'PAGO' | 'CANCELADO') => {
    switch (status) {
      case 'PAGO':
        return 'green';
      case 'PENDENTE':
        return 'gold';
      case 'CANCELADO':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">Funasinuca</div>
        <div className="header-user">
          <span className="user-badge">
            {userName} - {userRole}
          </span>
          <button className="btn-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-container">Carregando dados...</div>
      ) : erroMensagem ? (
        <div className="error-container">{erroMensagem}</div>
      ) : (
        <main className="dashboard-content">
          {/* SEÇÃO DA LINHA SUPERIOR (MÉTRICAS + BOTÃO CRIAR) */}
          <div className="dashboard-top-bar">
            <MetricsBar reservas={reservas} />
            <button className="btn-create-reservation" onClick={() => setIsCreateModalOpen(true)}>
              + Nova Reserva
            </button>
          </div>

          <div className="dashboard-grid-layout">
            <section className="calendar-section">
              <div className="calendar-controls">
                <button onClick={handlePrevMonth}>&lt;</button>
                <h3>
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth}>&gt;</button>
              </div>

              <div className="calendar-grid">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                  <div key={d} className="calendar-day-header">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday =
                    new Date().toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  const isSelected =
                    selectedDate.toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  const temReserva = hasReservation(day);

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        setSelectedDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                        )
                      }
                    >
                      <span className="day-number">{day}</span>
                      {temReserva && <span className="reservation-dot"></span>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="reservations-section">
              <h2>Reservas para {selectedDate.toLocaleDateString('pt-BR')}</h2>
              <div className="cards-container">
                {reservasDoDia.length === 0 ? (
                  <p className="empty-state">Sem reservas para esse dia.</p>
                ) : (
                  reservasDoDia.map((reserva) => (
                    <div key={reserva.id} className="reserva-card">
                      <div className="card-time">
                        {formatTime(reserva.horarioInicio)} - {formatTime(reserva.horarioFim)}
                      </div>
                      <div className="card-info">
                        <strong>Mesa {reserva.mesa.numero}</strong>
                        {/* Exibe o nome cadastrado do usuário dinamicamente */}
                        <span>{reserva.usuario?.nome || 'Usuário não identificado'}</span>
                      </div>
                      <div className="card-status">
                        <span
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(reserva.statusPagamento) }}
                          title={reserva.statusPagamento}
                        ></span>
                      </div>

                      {/* Painel de ações dinâmico e flexível */}
                      <div className="card-actions-wrapper">
                        {(userRole === 'ADMINISTRADOR' || userRole === 'FUNCIONARIO') && (
                          <>
                            {/* Botão de presença rápida se não estiver cancelado */}
                            {reserva.statusPagamento !== 'CANCELADO' &&
                              !reserva.presencaConfirmada && (
                                <button
                                  className="btn-quick-action btn-quick-success"
                                  title="Confirmar Presença"
                                  onClick={async () => {
                                    setSelectedReserva(reserva);
                                    const response = await reservasService.confirmarPresenca(
                                      reserva.id,
                                    );
                                    if (response.ok) await carregarDadosDoBanco();
                                  }}
                                >
                                  Confirmar
                                </button>
                              )}

                            {/* Botão de cancelamento rápido */}
                            {reserva.statusPagamento !== 'CANCELADO' && (
                              <button
                                className="btn-quick-action btn-quick-danger"
                                title="Cancelar Reserva"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Deseja cancelar a reserva de ${reserva.usuario.nome}?`,
                                    )
                                  ) {
                                    const response = await reservasService.cancelar(reserva.id);
                                    if (response.ok) await carregarDadosDoBanco();
                                  }
                                }}
                              >
                                Cancelar
                              </button>
                            )}

                            <button
                              className="btn-edit"
                              onClick={() => {
                                setSelectedReserva(reserva);
                                setIsEditModalOpen(true);
                              }}
                            >
                              Editar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* MODAL PARA FAZER CADASTRADOS ASSÍNCRONOS */}
      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={carregarDadosDoBanco}
      />

      {/* MODAL PARA GERENCIAMENTO DE OPERAÇÕES */}
      <EditReservationModal
        isOpen={isEditModalOpen}
        reserva={selectedReserva}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReserva(null);
          setModalErro('');
        }}
        onUpdate={handleAtualizarReserva}
        onConfirmPresence={handleConfirmarPresenca}
        onCancelReserva={handleCancelarReserva}
        modalActionLoading={modalActionLoading}
        modalErro={modalErro}
      />
    </div>
  );
}
