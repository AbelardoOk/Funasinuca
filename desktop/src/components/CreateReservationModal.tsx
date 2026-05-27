import { useEffect, useState } from 'react';
import { mesasService } from '../lib/api/endpoints/mesas';
import { reservasService } from '../lib/api/endpoints/reservas';
import { userService } from '../lib/api/endpoints/users';
import { CreateReservaPayload, MesaDisponivel, StatusPagamento, Usuario } from '../lib/api/types';

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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [mesas, setMesas] = useState<MesaDisponivel[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [selectedMesaId, setSelectedMesaId] = useState('');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(''); // 🚀 Novo estado para o cliente
  const [dataReserva, setDataReserva] = useState('');
  const [horaReserva, setHoraReserva] = useState('');
  const [numPessoas, setNumPessoas] = useState(2);
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>('PENDENTE');

  const [actionLoading, setActionLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      const carregarDadosIniciais = async () => {
        setLoadingMesas(true);
        setLoadingUsers(true);

        // Carrega mesas
        const resMesas = await mesasService.listarTodas();
        if (resMesas.ok && resMesas.data) {
          setMesas(
            resMesas.data.map((m) => ({
              id: m.id,
              numero: m.numero,
              disponivel: m.status === 'LIVRE' || m.ativa,
            })),
          );
        }
        setLoadingMesas(false);

        // 🚀 Carrega usuários cadastrados no banco
        const resUsers = await userService.getAll();
        if (resUsers.ok && resUsers.data) {
          setUsuarios(resUsers.data);
        }
        setLoadingUsers(false);
      };

      carregarDadosIniciais();
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

      const dataFim = new Date(dataInicio.getTime() + 30 * 60000);

      const formatarParaISOComFusoLocal = (date: Date) => {
        const tzo = -date.getTimezoneOffset();
        const dif = tzo >= 0 ? '+' : '-';
        const pad = (num: number) => String(num).padStart(2, '0');
        return (
          date.getFullYear() +
          '-' +
          pad(date.getMonth() + 1) +
          '-' +
          pad(date.getDate()) +
          'T' +
          pad(date.getHours()) +
          ':' +
          pad(date.getMinutes()) +
          ':' +
          pad(date.getSeconds()) +
          '.' +
          String(date.getMilliseconds()).padStart(3, '0') +
          dif +
          pad(Math.floor(Math.abs(tzo) / 60)) +
          ':' +
          pad(Math.abs(tzo) % 60)
        );
      };

      // Incluímos usuarioId opcional se o back-end aceitar a vinculação manual por admin/func
      const payload: CreateReservaPayload & { status?: StatusPagamento; usuarioId?: string } = {
        mesaId: selectedMesaId,
        horarioInicio: formatarParaISOComFusoLocal(dataInicio),
        horarioFim: formatarParaISOComFusoLocal(dataFim),
        numeroPessoas: numPessoas,
        status: statusPagamento,
        ...(selectedUsuarioId && { usuarioId: selectedUsuarioId }), // Vincula o cliente se selecionado
      };

      const response = await reservasService.criar(payload);
      if (response.ok) {
        onSuccess();
        onClose();
        setSelectedMesaId('');
        setSelectedUsuarioId('');
        setDataReserva('');
        setHoraReserva('');
        setStatusPagamento('PENDENTE');
      } else {
        setErro(response.error || response.message || 'Erro ao criar reserva.');
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
            {/* 🚀 NOVO CAMPO: Seleção do Cliente/Usuário */}
            <div className="form-group">
              <label htmlFor="createUsuarioSelect">Cliente / Solicitante</label>
              <select
                id="createUsuarioSelect"
                value={selectedUsuarioId}
                onChange={(e) => setSelectedUsuarioId(e.target.value)}
                disabled={loadingUsers}
                className="modal-select"
                required
              >
                <option value="" disabled>
                  {loadingUsers ? 'Buscando usuários...' : 'Selecione o cliente cadastrado'}
                </option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.email})
                  </option>
                ))}
              </select>
            </div>

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
                  Selecione uma opção
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

            <div className="form-group-row">
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

              <div className="form-group">
                <label htmlFor="createStatusSelect">Status do Pagamento</label>
                <select
                  id="createStatusSelect"
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value as StatusPagamento)}
                  className="modal-select"
                  required
                >
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="PAGO">PAGO</option>
                </select>
              </div>
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
