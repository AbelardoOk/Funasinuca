import { useEffect, useMemo, useState } from 'react';
import { CreateReservationModal } from './components/CreateReservationModal';
import { EditReservationModal } from './components/EditReservationModal';
import { MetricsBar } from './components/MetricsBar';
import './Dashboard.css';
import { reservasService } from './lib/api/endpoints/reservas';
import { ReservaData, UpdateReservaPayload } from './lib/api/types';
import { ReservasManagement } from './ReservasManagement';
import { ActiveTab, Sidebar } from './Sidebar';
import { UsersManagement } from './UsersManagement';

type TipoUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
  userRole: TipoUsuario;
}

export function Dashboard({ onLogout, userName, userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  // Handlers de Ação Rápida
  const handleConfirmarPresenca = async (res: ReservaData) => {
    const response = await reservasService.confirmarPresenca(res.id);
    if (response.ok) await carregarDadosDoBanco();
  };

  const handleCancelarReserva = async (res: ReservaData) => {
    if (window.confirm(`Deseja cancelar a reserva de ${res.usuario.nome}?`)) {
      const response = await reservasService.cancelar(res.id);
      if (response.ok) await carregarDadosDoBanco();
    }
  };

  const handleAtualizarReserva = async (payload: UpdateReservaPayload) => {
    if (!selectedReserva) return;
    setModalActionLoading(true);
    const response = await reservasService.atualizar(selectedReserva.id, payload);
    if (response.ok) {
      await carregarDadosDoBanco();
      setIsEditModalOpen(false);
    } else {
      setModalErro(response.message || 'Erro ao salvar alterações.');
    }
    setModalActionLoading(false);
  };

  // Logica do Calendário
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

  // 🚀 Cláusula de Barreira 1: Estado de Carregamento estruturado antes do return complexo
  if (loading) {
    return (
      <div
        className="dashboard-root-layout"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="loading-container">Carregando dados unificados do sistema...</div>
      </div>
    );
  }

  // 🚀 Cláusula de Barreira 2: Tratamento visual de erros críticos da API
  if (erroMensagem) {
    return (
      <div
        className="dashboard-root-layout"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="error-container">{erroMensagem}</div>
      </div>
    );
  }

  // 🚀 Return principal limpo, sem ternários complexos aninhados
  return (
    <div className="dashboard-root-layout">
      {/* MENU LATERAL GERENCIAL */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />

      <div className="dashboard-main-viewport">
        <header className="dashboard-header">
          <div className="header-breadcrumbs">
            <span>Sistema</span> /{' '}
            <strong style={{ textTransform: 'capitalize' }}>{activeTab}</strong>
          </div>
          <div className="header-user">
            <span className="user-badge">{userName}</span>
            <button className="btn-logout" onClick={onLogout}>
              Sair
            </button>
          </div>
        </header>

        <main className="dashboard-scrollable-content">
          {/* ABA 1: VISÃO GERAL (DASHBOARD + CALENDÁRIO) */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content animate-fade-in">
              <div className="dashboard-top-bar">
                <MetricsBar reservas={reservas} />
                <button
                  className="btn-create-reservation"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Nova Reserva
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
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day,
                        ).toDateString();
                      const isSelected =
                        selectedDate.toDateString() ===
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day,
                        ).toDateString();
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
                          <div className="card-time">{formatTime(reserva.horarioInicio)}</div>
                          <div className="card-info">
                            <strong>Mesa {reserva.mesa.numero}</strong>
                            <span>{reserva.usuario?.nome || 'Balcão'}</span>
                          </div>
                          <div className="card-status">
                            <span
                              className="status-dot"
                              style={{ backgroundColor: getStatusColor(reserva.statusPagamento) }}
                            ></span>
                          </div>

                          <div className="card-actions-wrapper">
                            {reserva.statusPagamento !== 'CANCELADO' &&
                              !reserva.presencaConfirmada && (
                                <button
                                  className="btn-quick-action btn-quick-success"
                                  onClick={() => handleConfirmarPresenca(reserva)}
                                >
                                  Confirmar
                                </button>
                              )}
                            {reserva.statusPagamento !== 'CANCELADO' && (
                              <button
                                className="btn-quick-action btn-quick-danger"
                                onClick={() => handleCancelarReserva(reserva)}
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
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ABA 2: GERENCIAMENTO DE USUÁRIOS NO BANCO */}
          {activeTab === 'usuarios' && <UsersManagement userRole={userRole} />}

          {/* ABA 3: GERENCIAMENTO HISTÓRICO DE RESERVAS E CAIXA */}
          {activeTab === 'reservas' && <ReservasManagement userRole={userRole} />}

          {/* ABA 4: PLACEHOLDER PARA GERENCIAMENTO DE MESAS */}
          {activeTab === 'mesas' && (
            <div className="management-panel">
              <h1>Estrutura de Mesas</h1>
              <p>
                Módulo para ativação/desativação física de mesas de snooker (Disponível na próxima
                release).
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PARA FAZER CADASTROS ASSÍNCRONOS */}
      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={carregarDadosDoBanco}
      />

      {/* MODAL PARA OPERAÇÕES ADMINISTRATIVAS CIRÚRGICAS */}
      <EditReservationModal
        isOpen={isEditModalOpen}
        reserva={selectedReserva}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReserva(null);
        }}
        onUpdate={handleAtualizarReserva}
        onConfirmPresence={() => handleConfirmarPresenca(selectedReserva!)}
        onCancelReserva={() => handleCancelarReserva(selectedReserva!)}
        modalActionLoading={modalActionLoading}
        modalErro={modalErro}
      />
    </div>
  );
}
