'use client' //acessar funções exclusivas

import Image from 'next/image';


import { useState, useEffect } from 'react'
//usesState -> hook para guardar estados(dados que mudam)
//udeEffect -> hook para rodar códigos após renderizar

export default function Home() {
  const [mesa, setMesa] = useState<string | null>(null)
  //criou a váriavel de estado = mesa
  //Criou função que altera o estado da mesa = setMesa
  //Definir a tipagem= A mesa começa como null, mas aceita somente dados do tipo String

  //Formulário
  const [mostrarForm, setMostrarForm] = useState<boolean>(false)

  //nome do cliente
  const [nome, setNome] = useState<string>('')

  //confirmar reserva
  const [confirmado, setConfirmado] = useState<boolean>(false)


  //type para definição de objetos
  type MesaInfo = {
    id: string
    numero: number
    status: 'disponivel' | 'reservada' | 'indisponivel'
    espera: number //fila
  }

  //dados da mesa
  const mesas: MesaInfo[] = [
    { id: 'm1', numero: 1, status: 'disponivel', espera: 0 },
    { id: 'm2', numero: 2, status: 'reservada', espera: 3 },
    { id: 'm3', numero: 3, status: 'disponivel', espera: 0 },
    { id: 'm4', numero: 4, status: 'indisponivel', espera: 0 },
  ]

  function corStatus(status: MesaInfo['status']): string {
    if (status === 'disponivel') return '#22c55e'
    if (status === 'reservada') return '#f59e0b'
    if (status === 'indisponivel') return '#ef4444'
    return '#9ca3af'
  }

  //conversar com BD
  function labelStatus(status: MesaInfo['status']): string {
    if (status === 'disponivel') return 'Disponível'
    if (status === 'reservada') return 'Reservada'
    if (status === 'indisponivel') return 'Indisponível'
    return status
  }

  //confirmar reserva
  function confirmarReserva() {
    if (!nome.trim()) return //Se o nome estiver vazio não retorna nada - trim() -> Limpar espaços em branco
    setConfirmado(true)
    setMostrarForm(true)
  }

  //o "HTML" tá aqui ó
  //<> -> Fragment. Agrupa sem criar outra div

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f2937',
      }}> <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#c52222' }}>
          🎱 Funasinuca
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          <a href="#como-funciona" style={{ transition: 'color 0.2s' }}>Como funciona</a>
          <a href="#mesas" style={{ transition: 'color 0.2s' }}>mesas</a>
          <a href="#reservar" style={{
            background: '#ab1709',
            color: '#0a0a0a',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>Reservar Agora</a>
        </div>
      </nav>

      {/*Principal*/}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '6rem 1.5rem 3rem',
      }}>

        <span style={{
          background: '#441701',
          color: '#fa3232',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
        }}>
          Batata+ Bar · Campo Grande, MS
        </span>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)', //clamp -> tamanho responsivo
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: '900px',
          marginBottom: '1.5rem',
        }}>
          Reserve sua mesa de{' '}
          <span style={{ color: '#e73e3e' }}>sinuca</span>
          {' '}sem fila
        </h1>

        {/*Subtitulo*/}
        <p style={{
          color: '#9ca3af',
          fontSize: '1.125rem',
          maxWidth: '560px',
          marginBottom: '2.5rem',
        }}>
          Consulte disponibilidade em tempo real, reserve por 30 minutos.
        </p>

        <a href="#mesas" style={{
          display: 'inline-block',
          background: '#e93030',
          color: '#0a0a0a',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '0.9rem 2.5rem',
          borderRadius: '999px',
        }}>
          Ver mesas disponíveis →
        </a>
      </section>

      {/*Funcionalidades*/}
      <section id='Como-funciona' style={{
        padding: '5rem 1.5rem',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}> Como funiona </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            { num: '01', titulo: 'Escolha a mesa', desc: 'Veja quais mesas estão livres' },
            { num: '02', titulo: 'Reserve por 30 min', desc: 'Garanta seu horário com antecedência' },
            { num: '03', titulo: 'Pague online', desc: 'Pagamento integrado' },
          ].map((passo) => (
            // "key" é obrigatório em listas para o React rastrear os itens
            <div key={passo.num} style={{
              background: '#111827',
              border: '1px solid #1f2937',
              borderRadius: '1rem',
              padding: '1.75rem',
            }}>
              <span style={{ color: '#c52222', fontWeight: 800, fontSize: '1.5rem' }}>
                {passo.num}
              </span>
              <h3 style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{passo.titulo}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{passo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*MESAS*/}
      <section id='mesas' style={{
        padding: '5rem 1.5rem',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mesas agora</h2>
        <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem' }}>Clique em uma mesa disponível para reservar</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}>
          {mesas.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                //só em mesas disponíveis
                if (m.status === 'disponivel') {
                  setMesa(m.id)
                  setMostrarForm(true)
                  setConfirmado(false)
                }
              }}
              style={{
                background: '#111827',
                border: `2px solid ${mesa === m.id ? '#22c55e' : '#1f2937'}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: m.status === 'disponivel' ? 'pointer' : 'not-allowed',
                opacity: m.status === 'indisponivel' ? 0.5 : 1,
                transition: 'border-color 0.2s, transform 0.15s',
              }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎱</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                Mesa {m.numero}
              </h3>

              {/* Bolinha colorida + texto de status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: corStatus(m.status),
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {labelStatus(m.status)}
                </span>
              </div>

              {/*Fila de espera*/}
              {m.espera > 0 && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  {m.espera} na fila
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/*Form Reservas*/}

      {mostrarForm && (
        <section id='reservar' style={{
          padding: '4rem 1.5rem',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '1.25rem',
            padding: '2rem',
          }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
              Reservar Mesa {mesas.find(m => m.id === mesa)?.numero} {/*mesas.find => retorna mesas pelo id. O "?" evita o erro se nada for encontrado*/}
            </h2>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Seu nome
            </label>
            <input
              type="text"
              value={nome}
              // "e" = evento do input | e.target.value = texto digitado
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #374151',
                background: '#0a0a0a',
                color: '#fff',
                fontSize: '1rem',
                marginBottom: '1.25rem',
                outline: 'none',
              }} />

            <div style={{
              background: '#2e0605',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#ef8886',
            }}>
              ⏱ Sessão de <strong>30 minutos</strong> · Pagamento online
            </div>

            {/* Botão de confirmar */}
            <button
              onClick={confirmarReserva}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: '#c53522',
                color: '#0a0a0a',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
              }}
            >
              Confirmar reserva
            </button>
          </div>
        </section>
      )}

      {/*Confirmação*/}
      {confirmado && (
        <section style={{
          padding: '3rem 1.5rem',
          maxWidth: '480px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            background: '#052e16',
            border: '1px solid #166534',
            borderRadius: '1.25rem',
            padding: '2.5rem',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontWeight: 700, color: '#86efac', marginBottom: '0.5rem' }}>
              Reserva confirmada!
            </h2>
            <p style={{ color: '#6ee7b7' }}>
              <strong>{nome}</strong>! Sua mesa está garantida por 30 minutos.
            </p>
          </div>
        </section>
      )}


      {/*Rodapé*/}
      <footer style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        borderTop: '1px solid #1f2937',
        color: '#6b7280',
        fontSize: '0.875rem',
        marginTop: '4rem',
      }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#9ca3af' }}>
          🎱 Funasinuca
        </p>
        <p>Desenvolvido para o Batata+ Bar · Campo Grande, MS</p>
        <p style={{ marginTop: '0.5rem', color: '#374151' }}>© 2025 Funasinuca</p>
      </footer>

    </>
  )
}
