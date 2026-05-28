import Link from 'next/link';

// ── Dados do site ──────────────────────────────────────────────────────────
const HORARIOS_FUNC = [
  { dia: 'Seg – Sex', hora: '10h às 23h' },
  { dia: 'Sábado', hora: '10h às 00h' },
  { dia: 'Domingo', hora: '12h às 22h' },
];

const MESAS_INFO = [
  {
    tipo: 'Standard',
    lugares: 4,
    descricao: 'Mesas clássicas para partidas rápidas',
    destaque: false,
  },
  {
    tipo: 'Semi-Pro',
    lugares: 6,
    descricao: 'Ótima para grupos e torneios amistosos',
    destaque: true,
  },
  { tipo: 'VIP', lugares: 8, descricao: 'Espaço premium com mesa profissional', destaque: false },
];

const DEPOIMENTOS = [
  { nome: 'Rafael M.', texto: 'Melhor lugar da cidade para jogar. Ambiente incrível!' },
  { nome: 'Juliana S.', texto: 'Reservei online em 1 minuto. Processo super fácil.' },
  { nome: 'Pedro A.', texto: 'Estrutura impecável, voltamos toda semana com os amigos.' },
];

// ── Componente ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={s.page}>
      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <div style={s.navLogo}>🎱</div>
          <span style={s.navTitle}>Funasinuca</span>
        </div>
        <Link href="/login" style={s.navCta}>
          Entrar
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroBadge}>🎱 Aberto agora</div>
          <h1 style={s.heroTitle}>
            A sinuca
            <br />
            <span style={s.heroDestaque}>que você merece.</span>
          </h1>
          <p style={s.heroDesc}>
            Reserve sua mesa online em segundos. Ambiente descontraído, mesas profissionais e
            diversão garantida para você e seus amigos.
          </p>
          <div style={s.heroActions}>
            <Link href="/login" style={s.heroBtnPrimario}>
              Reservar mesa
            </Link>
            <a href="#sobre" style={s.heroBtnSecundario}>
              Saiba mais ↓
            </a>
          </div>
        </div>
        {/* Detalhe decorativo */}
        <div style={s.heroOrb} aria-hidden />
      </section>

      {/* ── Sobre ── */}
      <section id="sobre" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.tag}>Quem somos</div>
          <h2 style={s.sectionTitle}>Um espaço feito para quem ama o jogo</h2>
          <p style={s.sectionDesc}>
            O Funasinuca é o ponto de encontro dos apaixonados por sinuca em Campo Grande. Com mesas
            regulamentadas, atmosfera descontraída e sistema de reservas online, garantimos que sua
            partida comece sem espera e termine com vontade de mais.
          </p>
          <div style={s.statsRow}>
            {[
              { n: '8', label: 'Mesas disponíveis' },
              { n: '5+', label: 'Anos de história' },
              { n: '4k+', label: 'Reservas realizadas' },
            ].map((st) => (
              <div key={st.label} style={s.statCard}>
                <span style={s.statNum}>{st.n}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mesas ── */}
      <section style={{ ...s.section, background: '#F9F9F7' }}>
        <div style={s.sectionInner}>
          <div style={s.tag}>Nossas mesas</div>
          <h2 style={s.sectionTitle}>Escolha a mesa ideal para você</h2>
          <div style={s.mesasGrid}>
            {MESAS_INFO.map((m) => (
              <div
                key={m.tipo}
                style={{ ...s.mesaCard, ...(m.destaque ? s.mesaCardDestaque : {}) }}
              >
                {m.destaque && <div style={s.mesaPopular}>Popular</div>}
                <div style={s.mesaIcone}>🪑</div>
                <h3 style={s.mesaTipo}>{m.tipo}</h3>
                <p style={s.mesaLugares}>{m.lugares} lugares</p>
                <p style={s.mesaDesc}>{m.descricao}</p>
                <Link
                  href="/login"
                  style={{ ...s.mesaBtn, ...(m.destaque ? s.mesaBtnDestaque : {}) }}
                >
                  Reservar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Horários ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.tag}>Funcionamento</div>
          <h2 style={s.sectionTitle}>Quando você pode jogar</h2>
          <div style={s.horariosGrid}>
            {HORARIOS_FUNC.map((h) => (
              <div key={h.dia} style={s.horarioCard}>
                <span style={s.horarioDia}>{h.dia}</span>
                <span style={s.horarioHora}>{h.hora}</span>
              </div>
            ))}
          </div>
          <div style={s.enderecoBox}>
            <span style={s.enderecoIcone}>📍</span>
            <div>
              <div style={s.enderecoLabel}>Endereço</div>
              <div style={s.enderecoValor}>Rua Exemplo, 123 — Campo Grande, MS</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section style={{ ...s.section, background: '#F9F9F7' }}>
        <div style={s.sectionInner}>
          <div style={s.tag}>Quem frequenta</div>
          <h2 style={s.sectionTitle}>O que dizem nossos clientes</h2>
          <div style={s.depGrid}>
            {DEPOIMENTOS.map((d) => (
              <div key={d.nome} style={s.depCard}>
                <p style={s.depTexto}>"{d.texto}"</p>
                <div style={s.depNome}>{d.nome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Pronto para jogar?</h2>
          <p style={s.ctaDesc}>Crie sua conta e reserve sua mesa em menos de 1 minuto.</p>
          <Link href="/login" style={s.ctaBtn}>
            Reservar agora
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerBrand}>
          <div style={s.navLogo}>🎱</div>
          <span style={s.footerNome}>Funasinuca</span>
        </div>
        <p style={s.footerCopy}>
          © {new Date().getFullYear()} Funasinuca. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#FFFFFF',
    fontFamily: "'Geist','DM Sans','Inter',sans-serif",
    color: '#111',
  },

  // Nav
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '62px',
    borderBottom: '1px solid #EBEBEB',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 20,
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo: {
    width: '36px',
    height: '36px',
    background: '#F5C518',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  navTitle: { fontSize: '17px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px' },
  navCta: {
    background: '#111',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background .15s',
  },

  // Hero
  hero: {
    minHeight: '88vh',
    display: 'flex',
    alignItems: 'center',
    padding: '4rem 2rem',
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: '560px' },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFBEA',
    border: '1px solid #F5C518',
    borderRadius: '100px',
    padding: '5px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#7B5E00',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: 'clamp(42px, 6vw, 72px)',
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: '-2px',
    margin: '0 0 1.25rem',
    color: '#111',
  },
  heroDestaque: { color: '#F5C518' },
  heroDesc: {
    fontSize: '17px',
    color: '#555',
    lineHeight: 1.6,
    maxWidth: '460px',
    margin: '0 0 2rem',
  },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  heroBtnPrimario: {
    background: '#F5C518',
    color: '#111',
    padding: '14px 28px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '-0.2px',
  },
  heroBtnSecundario: {
    background: 'none',
    color: '#888',
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 500,
    textDecoration: 'none',
  },
  heroOrb: {
    position: 'absolute',
    right: '-80px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '420px',
    height: '420px',
    background: 'radial-gradient(circle, rgba(245,197,24,0.18) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  // Sections
  section: { padding: '5rem 2rem', background: '#fff' },
  sectionInner: { maxWidth: '860px', margin: '0 auto' },
  tag: {
    display: 'inline-block',
    background: '#F5C518',
    color: '#111',
    fontWeight: 600,
    fontSize: '12px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: 'clamp(24px, 4vw, 36px)',
    fontWeight: 800,
    letterSpacing: '-0.8px',
    margin: '0 0 1rem',
    color: '#111',
  },
  sectionDesc: { fontSize: '16px', color: '#666', lineHeight: 1.7, maxWidth: '560px' },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '2.5rem',
    maxWidth: '500px',
  },
  statCard: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statNum: { fontSize: '36px', fontWeight: 800, color: '#111', letterSpacing: '-1px' },
  statLabel: { fontSize: '13px', color: '#888' },

  // Mesas
  mesasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  mesaCard: {
    background: '#fff',
    border: '1.5px solid #EBEBEB',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
  },
  mesaCardDestaque: { border: '2px solid #F5C518', boxShadow: '0 4px 30px rgba(245,197,24,.15)' },
  mesaPopular: {
    position: 'absolute',
    top: '-1px',
    right: '16px',
    background: '#F5C518',
    color: '#111',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '0 0 8px 8px',
    letterSpacing: '0.3px',
  },
  mesaIcone: { fontSize: '28px', marginBottom: '4px' },
  mesaTipo: { fontSize: '17px', fontWeight: 700, color: '#111', margin: 0 },
  mesaLugares: { fontSize: '13px', color: '#888', margin: 0 },
  mesaDesc: { fontSize: '14px', color: '#555', lineHeight: 1.5, margin: '0 0 auto' },
  mesaBtn: {
    marginTop: '1rem',
    padding: '10px',
    background: '#F9F9F7',
    border: '1.5px solid #E5E5E5',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#111',
    textDecoration: 'none',
    textAlign: 'center',
  },
  mesaBtnDestaque: { background: '#F5C518', border: 'none' },

  // Horários
  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  horarioCard: {
    background: '#F9F9F7',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  horarioDia: { fontSize: '13px', color: '#888', fontWeight: 500 },
  horarioHora: { fontSize: '18px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px' },
  enderecoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F9F9F7',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    marginTop: '1rem',
    maxWidth: '400px',
  },
  enderecoIcone: { fontSize: '22px' },
  enderecoLabel: { fontSize: '12px', color: '#888', marginBottom: '2px' },
  enderecoValor: { fontSize: '14px', fontWeight: 500, color: '#111' },

  // Depoimentos
  depGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  depCard: {
    background: '#fff',
    border: '1px solid #EBEBEB',
    borderRadius: '14px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  depTexto: { fontSize: '15px', color: '#444', lineHeight: 1.6, margin: 0, fontStyle: 'italic' },
  depNome: { fontSize: '13px', fontWeight: 600, color: '#111' },

  // CTA
  ctaSection: { background: '#111', padding: '5rem 2rem' },
  ctaInner: { maxWidth: '860px', margin: '0 auto', textAlign: 'center' },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-1px',
    margin: '0 0 1rem',
  },
  ctaDesc: { fontSize: '16px', color: '#888', margin: '0 0 2rem' },
  ctaBtn: {
    display: 'inline-block',
    background: '#F5C518',
    color: '#111',
    padding: '15px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '-0.2px',
  },

  // Footer
  footer: {
    padding: '1.75rem 2rem',
    borderTop: '1px solid #EBEBEB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  footerNome: { fontSize: '15px', fontWeight: 700, color: '#111' },
  footerCopy: { fontSize: '13px', color: '#999', margin: 0 },
};
