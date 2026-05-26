import { useState, useMemo, useEffect } from "react";
import { reservasService, ReservaData } from "./lib/api/endpoints/reservas"; 
import { invoke } from "@tauri-apps/api/core";
import "./Dashboard.css";

type TipoUsuario = "CLIENTE" | "FUNCIONARIO" | "ADMINISTRADOR";

interface DashboardProps {
  onLogout: () => void;
  userName: string;
  userRole: TipoUsuario; 
}

export function Dashboard({ onLogout, userName, userRole }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMensagem, setErroMensagem] = useState("");

  // Dispara a busca assim que o usuário entra no Dashboard
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      
      let response;

      if (userRole === "CLIENTE") {
        // Chamada limpa, usando o serviço!
        response = await reservasService.listarMinhas();
      } else {
        response = await reservasService.listarTodas();
      }

      if (response.ok && response.data) {
        setReservas(response.data);
      } else {
        setErroMensagem(response.error || response.message || "Erro ao carregar dados.");
      }
      setLoading(false);
    };

    carregarDados();
  }, [userRole]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const hasReservation = (day: number) => {
    return reservas.some(r => {
      const resDate = new Date(r.horarioInicio);
      return resDate.getDate() === day && 
             resDate.getMonth() === currentDate.getMonth() && 
             resDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const reservasDoDia = useMemo(() => {
    return reservas.filter(r => {
      const resDate = new Date(r.horarioInicio);
      return resDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, reservas]);

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: "PENDENTE" | "PAGO" | "CANCELADO") => {
    switch (status) {
      case "PAGO": return "green";
      case "PENDENTE": return "gold";
      case "CANCELADO": return "red";
      default: return "gray";
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-brand">Funasinuca</div>
        <div className="header-user">
          <span className="user-badge">{userName} - {userRole}</span>
          <button className="btn-logout" onClick={onLogout}>Sair</button>
        </div>
      </header>

      {loading ? (
        <div className="loading-container">Carregando reservas do banco de dados...</div>
      ) : erroMensagem ? (
        <div className="error-container">{erroMensagem}</div>
      ) : (
        <main className="dashboard-content">
          <section className="calendar-section">
            <div className="calendar-controls">
              <button onClick={handlePrevMonth}>&lt;</button>
              <h3>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={handleNextMonth}>&gt;</button>
            </div>
            
            <div className="calendar-grid">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const isSelected = selectedDate.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const temReserva = hasReservation(day);

                return (
                  <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
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
                reservasDoDia.map(reserva => (
                  <div key={reserva.id} className="reserva-card">
                    <div className="card-time">
                      {formatTime(reserva.horarioInicio)} - {formatTime(reserva.horarioFim)}
                    </div>
                    <div className="card-info">
                      <strong>Mesa {reserva.mesa.numero}</strong>
                      <span>{reserva.usuario.nome}</span>
                    </div>
                    <div className="card-status">
                      <span 
                        className="status-dot" 
                        style={{ backgroundColor: getStatusColor(reserva.statusPagamento) }}
                        title={reserva.statusPagamento}
                      ></span>
                    </div>
                    {(userRole === "ADMINISTRADOR" || userRole === "FUNCIONARIO") && (
                      <button className="btn-edit" onClick={() => setIsEditModalOpen(true)}>
                        Editar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      )}

      {/* MODAL SIMPLES DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Reserva</h2>
            <p>Voltaremos nas funções do botão mais tarde.</p>
            <button onClick={() => setIsEditModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}