'use client';

import { reservaService } from '@/lib/api/reservas';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';

initMercadoPago(process.env.MP_PUBLIC_KEY ?? '', {
  locale: 'pt-BR',
});

interface Props {
  reservaId: string;
  token: string;
}

export default function BotaoPagamento({ reservaId, token }: Props) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    reservaService
      .criarPagamento(reservaId, token)
      .then((res) => {
        if (res.ok && res.data) setPreferenceId(res.data.preferenceId);
        else setErro('Erro ao iniciar pagamento');
      })
      .catch(() => setErro('Erro ao iniciar pagamento'));
  }, [reservaId, token]);

  if (erro) return <p>{erro}</p>;
  if (!preferenceId) return <p>Carregando pagamento...</p>;

  return <Wallet initialization={{ preferenceId }} />;
}
