import { useEffect, useState } from 'react';
import { mesasService } from '../lib/api/endpoints/mesas';
import { MesaDisponivel, ReservaData, UpdateReservaPayload } from '../lib/api/types';

interface EditReservationModalProps {
  isOpen: boolean;
  reserva: ReservaData | null;
  onClose: () => void;
  onUpdate: (payload: UpdateReservaPayload) => Promise<void>;
  onConfirmPresence: () => Promise<void>;
  onCancelReserva: () => Promise<void>;
  modalActionLoading: boolean;
  modalErro: string;
}

export function EditReservationModal({
  isOpen,
  reserva,
  onClose,
  onUpdate,
  onConfirmPresence,
  onCancelReserva,
  modalActionLoading,
  modalErro,
}: EditReservationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [mesas, setMesas] = useState<MesaDisponivel[]>([]);

  const [novaMesaId, setNovaMesaId] = useState('');
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');

  useEffect(() => {
    if (reserva) {
      setNovaMesaId(reserva.mesa.id || '');
      if (reserva.horarioInicio) {
        const [dataParte, horaParte] = reserva.horarioInicio.split('T');
        setNovaData(dataParte);
        setNovoHorario(horaParte.substring(0, 5));
      }
      setIsEditing(false);
    }
  }, [reserva, isOpen]);

  useEffect(() => {
    if (isOpen && isEditing) {
      const carregarMesas = async () => {
        setLoadingMesas(true);
        const response = await mesasService.listarTodas();
        if (response.ok && response.data) {
          setMesas(
            response.data.map((m) => ({
              id: m.id,
              numero: m.numero,
              disponivel: m.status === 'LIVRE' || m.ativa,
            })),
          );
        }
        setLoadingMesas(false);
      };
      carregarMesas();
    }
  }, [isOpen, isEditing]);

  if (!isOpen || !reserva) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stringDataHoraConcat = `${novaData}T${novoHorario}:00`;
    const dataInicio = new Date(stringDataHoraConcat);

    if (isNaN(dataInicio.getTime())) {
      return;
    }

    const offset = dataInicio.getTimezoneOffset() * 60000;
    const dataLocalISO = new Date(dataInicio.getTime() - offset).toISOString().slice(0, -1);

    onUpdate({
      mesaId: novaMesaId || undefined,
      horarioInicio: dataLocalISO,
      status: reserva.statusPagamento,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Gerenciar Reserva</h2>
          <button type="button" className="modal-close-x" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="modal-body">
            <div className={`form-section-readonly ${isEditing ? 'blur-dim' : ''}`}>
              <div className="info-row">
                <span>Cliente</span>
                <strong>{reserva.usuario.nome}</strong>
              </div>
              <div className="info-row">
                <span>Status do Pagamento</span>
                <span className={`status-badge status-${reserva.statusPagamento.toLowerCase()}`}>
                  {reserva.statusPagamento}
                </span>
              </div>
            </div>

            <div className="form-section-inputs">
              <h3>Dados da Agenda</h3>
              <div className="form-group">
                <label htmlFor="mesaSelect">Mesa Selecionada</label>
                {!isEditing ? (
                  <input
                    id="mesaSelect"
                    type="text"
                    value={`Mesa Número ${reserva.mesa.numero}`}
                    disabled
                  />
                ) : (
                  <select
                    id="mesaSelect"
                    value={novaMesaId}
                    onChange={(e) => setNovaMesaId(e.target.value)}
                    disabled={modalActionLoading || loadingMesas}
                    className="modal-select"
                    required
                  >
                    <option value="" disabled>
                      {loadingMesas ? 'Carregando...' : 'Selecione uma mesa'}
                    </option>
                    {mesas.map((m) => (
                      <option key={m.id} value={m.id}>
                        Mesa {m.numero} {!m.disponivel && '(Ocupada)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="novaData">Data</label>
                  <input
                    id="novaData"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    disabled={!isEditing || modalActionLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="novoHorario">Horário de Início</label>
                  <input
                    id="novoHorario"
                    type="time"
                    value={novoHorario}
                    onChange={(e) => setNovoHorario(e.target.value)}
                    disabled={!isEditing || modalActionLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions-bar">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn-modal btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Modificar Horário / Mesa
                </button>
              ) : (
                <div className="btn-group-split">
                  <button
                    type="submit"
                    className="btn-modal btn-success"
                    disabled={modalActionLoading}
                  >
                    Confirmar Alterações
                  </button>
                  <button
                    type="button"
                    className="btn-modal btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {modalErro && <div className="modal-alert-error">{modalErro}</div>}
          </div>

          <div className="modal-footer">
            <h4>Ações Administrativas</h4>
            <div className="btn-group-row">
              <button
                type="button"
                className="btn-modal btn-outline-success"
                onClick={onConfirmPresence}
                disabled={
                  isEditing || modalActionLoading || reserva.statusPagamento === 'CANCELADO'
                }
              >
                Confirmar Presença
              </button>
              <button
                type="button"
                className="btn-modal btn-outline-danger"
                onClick={onCancelReserva}
                disabled={
                  isEditing || modalActionLoading || reserva.statusPagamento === 'CANCELADO'
                }
              >
                Cancelar Reserva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
