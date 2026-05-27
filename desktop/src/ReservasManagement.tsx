import { useEffect, useMemo, useState } from 'react';
import { reservasService } from './lib/api/endpoints/reservas';
import { ReservaData, UpdateReservaPayload } from './lib/api/types';

interface ReservasManagementProps {
  userRole: 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';
}

export function ReservasManagement({ userRole }: ReservasManagementProps) {
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Controla o ID da linha que está sendo editada no momento
  const [idLinhaEmEdicao, setIdLinhaEmEdicao] = useState<string | null>(null);
  // Armazena o preço temporário digitado pelo administrador
  const [valorPrecoInput, setValorPrecoInput] = useState<string>('');

  const isAdmin = userRole === 'ADMINISTRADOR';

  const carregarTodasReservas = async () => {
    setLoading(true);
    const response = await reservasService.listarTodas();
    if (response.ok && response.data) {
      setReservas(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarTodasReservas();
  }, []);

  const handleIniciarEdicao = (reserva: ReservaData) => {
    setIdLinhaEmEdicao(reserva.id);
    // Se o banco já tiver preço cadastrado usa ele, senão inicia com o padrão de 30
    setValorPrecoInput(String(reserva.preco ?? 30.0));
  };

  const handleSalvarEdicao = async (reservaId: string) => {
    const precoNumerico = Number(valorPrecoInput);

    if (isNaN(precoNumerico) || precoNumerico < 0) {
      alert('Por favor, insira um preço numérico válido.');
      return;
    }

    try {
      const payload: UpdateReservaPayload & { preco?: number } = {
        preco: precoNumerico,
      };

      const response = await reservasService.atualizar(reservaId, payload);

      if (response.ok) {
        alert('Preço da reserva atualizado com sucesso!');
        setIdLinhaEmEdicao(null);
        await carregarTodasReservas(); // Recarrega a lista para atualizar as métricas financeiras
      } else {
        alert(response.message || 'Erro ao atualizar preço da reserva.');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Calcula os valores gerenciais baseados no preço individual real de cada registro do banco
  const relatorioFinanceiro = useMemo(() => {
    const pagas = reservas.filter((r) => r.statusPagamento === 'PAGO');
    const pendentes = reservas.filter((r) => r.statusPagamento === 'PENDENTE');

    const totalArrecadado = pagas.reduce((acc, r) => acc + (r.preco ?? 30.0), 0);
    const totalPendente = pendentes.reduce((acc, r) => acc + (r.preco ?? 30.0), 0);

    return {
      totalArrecadado,
      totalPendente,
      quantidadePagas: pagas.length,
    };
  }, [reservas]);

  const reservasFiltradas = reservas.filter((r) => {
    if (filtroStatus === 'TODOS') return true;
    return r.statusPagamento === filtroStatus;
  });

  return (
    <div className="management-panel">
      <div className="panel-header">
        <div>
          <h1>Relatório de Caixa e Reservas</h1>
          <p>
            Audite os fluxos financeiros, pagamentos pendentes e histórico operacional de partidas.
          </p>
        </div>
        <button className="btn-refresh" onClick={carregarTodasReservas}>
          🔄 Atualizar Tabela
        </button>
      </div>

      {/* Bloco de Valores Gerenciais */}
      <div className="values-row">
        <div className="value-card total-cash">
          <span>Faturamento Realizado (PAGO)</span>
          <h2>R$ {relatorioFinanceiro.totalArrecadado.toFixed(2)}</h2>
          <small>{relatorioFinanceiro.quantidadePagas} transações concluídas</small>
        </div>
        <div className="value-card pending-cash">
          <span>Previsão de Caixa (PENDENTE)</span>
          <h2>R$ {relatorioFinanceiro.totalPendente.toFixed(2)}</h2>
          <small>Aguardando confirmação no balcão</small>
        </div>
      </div>

      <div className="panel-actions">
        <label>Filtrar por Status Bancário:</label>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="TODOS">Todas as Reservas</option>
          <option value="PAGO">Apenas PAGAS</option>
          <option value="PENDENTE">Apenas PENDENTES</option>
          <option value="CANCELADO">Apenas CANCELADAS</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Calculando livros de registros...</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data da Partida</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Valor Cobrado</th> {/* Nova coluna de valor */}
                <th>Status</th>
                <th>Check-in</th>
                {isAdmin && <th>Ações</th>} {/* Coluna condicional de ações */}
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((res) => (
                <tr key={res.id}>
                  <td>
                    <strong>{new Date(res.horarioInicio).toLocaleDateString('pt-BR')}</strong>
                  </td>
                  <td>
                    {new Date(res.horarioInicio).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{res.usuario?.nome || 'Balcão'}</td>
                  <td>
                    <span className="table-mesa-tag">Mesa {res.mesa.numero}</span>
                  </td>

                  {/* CÉLULA DE PREÇO CONDICIONAL/EDITÁVEL */}
                  <td>
                    {idLinhaEmEdicao === res.id ? (
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={valorPrecoInput}
                        onChange={(e) => setValorPrecoInput(e.target.value)}
                        className="table-input-price"
                        style={{
                          width: '80px',
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    ) : (
                      <span>R$ {(res.preco ?? 30.0).toFixed(2)}</span>
                    )}
                  </td>

                  <td>
                    <span className={`status-badge status-${res.statusPagamento.toLowerCase()}`}>
                      {res.statusPagamento}
                    </span>
                  </td>
                  <td>
                    {res.presencaConfirmada ? (
                      <span className="check-done">🟢 Confirmado</span>
                    ) : res.statusPagamento === 'CANCELADO' ? (
                      <span className="text-muted">✕ Cancelada</span>
                    ) : (
                      <span className="check-waiting">⏳ Aguardando</span>
                    )}
                  </td>

                  {/* BOTÕES DE CONTROLE COMPORTAMENTAL DO ADMIN */}
                  {isAdmin && (
                    <td>
                      {idLinhaEmEdicao === res.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleSalvarEdicao(res.id)}
                            className="btn-quick-action btn-quick-success"
                            style={{ padding: '2px 6px' }}
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setIdLinhaEmEdicao(null)}
                            className="btn-quick-action"
                            style={{ padding: '2px 6px', background: '#e2e8f0' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleIniciarEdicao(res)}
                          className="btn-edit"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          Alterar Preço
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
