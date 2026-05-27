import { useEffect, useState } from 'react';
import { mesasService } from '../lib/api/endpoints/mesas';
import { reservasService } from '../lib/api/endpoints/reservas';
import { CreateReservaPayload, MesaDisponivel } from '../lib/api/types';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateReservationModalProps) {
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [mesas, setMesas] = useState<MesaDisponivel[]>([]);

  const [selectedMesaId, setSelectedMesaId] = useState('');
  const [dataReserva, setDataReserva] = useState('');
  const [horaReserva, setHoraReserva] = useState('');
  const [numPessoas, setNumPessoas] = useState(2);

  const [actionLoading, setActionLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErro('');

    try {
      const stringDataHoraConcat = `${dataReserva}T${horaReserva}:00`;
      const dataInicio = new Date(stringDataHoraConcat);

      if (isNaN(dataInicio.getTime())) {
        setErro('Selecione uma data e horário válidos.');
        setActionLoading(false);
        return;
      }

      // Regra de Negócio: Fim automático em +30 minutos
      const dataFim = new Date(dataInicio.getTime() + 30 * 60000);

      // Conversão segura de Timezone para evitar distorções no banco (Prisma/Elysia)
      const offset = dataInicio.getTimezoneOffset() * 60000;
      const dataLocalISO = new Date(dataInicio.getTime() - offset).toISOString().slice(0, -1);
      const dataFimLocalISO = new Date(dataFim.getTime() - offset).toISOString().slice(0, -1);

      const payload: CreateReservaPayload = {
        mesa_id: selectedMesaId,
        horario_inicio: dataLocalISO,
        horario_fim: dataFimLocalISO,
        numero_pessoas: numPessoas,
      };

      const response = await reservasService.criar(payload);
      if (response.ok) {
        onSuccess();
        onClose();
        setSelectedMesaId('');
        setDataReserva('');
        setHoraReserva('');
      } else {
        setErro(response.message || 'Erro ao criar reserva.');
      }
    } catch (err) {
      setErro('Erro interno ao processar a operação.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Nova Reserva</h2>
          <button type="button" className="modal-close-x" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="createMesaSelect">Selecione a Mesa</label>
              <select
                id="createMesaSelect"
                value={selectedMesaId}
                onChange={(e) => setSelectedMesaId(e.target.value)}
                disabled={loadingMesas}
                className="modal-select"
                required
              >
                <option value="" disabled>
                  {loadingMesas ? 'Buscando mesas...' : 'Selecione uma opção'}
                </option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} {!m.disponivel && '(Ocupada/Indisponível)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="createData">Data</label>
                <input
                  id="createData"
                  type="date"
                  value={dataReserva}
                  onChange={(e) => setDataReserva(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="createHora">Horário de Início</label>
                <input
                  id="createHora"
                  type="time"
                  value={horaReserva}
                  onChange={(e) => setHoraReserva(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="createPessoas">Quantidade de Pessoas</label>
              <input
                id="createPessoas"
                type="number"
                min={1}
                max={10}
                value={numPessoas}
                onChange={(e) => setNumPessoas(Number(e.target.value))}
                required
              />
            </div>

            {erro && <div className="modal-alert-error">{erro}</div>}
          </div>
          <div className="modal-footer">
            <div className="btn-group-split">
              <button type="submit" className="btn-modal btn-success" disabled={actionLoading}>
                {actionLoading ? 'Agendando...' : 'Criar Reserva'}
              </button>
              <button type="button" className="btn-modal btn-secondary" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
