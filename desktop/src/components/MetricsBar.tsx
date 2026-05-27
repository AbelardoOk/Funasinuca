import { useMemo } from 'react';
import { ReservaData } from '../lib/api/types';

interface MetricsBarProps {
  reservas: ReservaData[];
}

export function MetricsBar({ reservas }: MetricsBarProps) {
  const metrics = useMemo(() => {
    const total = reservas.length;
    const concluidas = reservas.filter((r) => r.statusPagamento === 'PAGO').length;
    const canceladas = reservas.filter((r) => r.statusPagamento === 'CANCELADO').length;
    const pendentes = reservas.filter((r) => r.statusPagamento === 'PENDENTE').length;

    // Métrica extra: Taxa de Ocupação/Aproveitamento das Reservas
    const taxaAproveitamento = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return { total, concluidas, canceladas, pendentes, taxaAproveitamento };
  }, [reservas]);

  return (
    <div className="metrics-container">
      <div className="metric-card total">
        <span className="metric-label">Todas as Reservas</span>
        <strong className="metric-value">{metrics.total}</strong>
      </div>
      <div className="metric-card success">
        <span className="metric-label">Concluídas (Pagas)</span>
        <strong className="metric-value">{metrics.concluidas}</strong>
      </div>
      <div className="metric-card pending">
        <span className="metric-label">Aguardando Pagamento</span>
        <strong className="metric-value">{metrics.pendentes}</strong>
      </div>
      <div className="metric-card danger">
        <span className="metric-label">Canceladas</span>
        <strong className="metric-value">{metrics.canceladas}</strong>
      </div>
      <div className="metric-card info">
        <span className="metric-label">Taxa de Conversão</span>
        <strong className="metric-value">{metrics.taxaAproveitamento}%</strong>
      </div>
    </div>
  );
}
