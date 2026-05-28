'use client';

import { userService } from '@/lib/api/users';
import { ApiResponse, TipoUsuario } from '@/lib/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse<{ token: string; userRole: TipoUsuario }> | null>(
    null,
  );
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useLocalStorage('token', '');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function validateUserToken() {
      try {
        const req = await userService.validate(token);

        if (req.ok) {
          if (isHydrated) {
            router.push('/dashboard');
          }
        } else {
          setToken('');
        }
      } catch (error) {
        console.error('Erro na validação do token:', error);
        setToken('');
      }
    }

    // 4. Chama a função criada
    validateUserToken();
  }, [token, isHydrated, router, setToken]);

  async function realizarLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const senha = (form.elements.namedItem('password') as HTMLInputElement).value;

    setLoading(true);
    setMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg('Por favor, insira um formato de e-mail válido.');
      setLoading(false);
      return;
    }

    if (senha.length < 8) {
      setMsg('A senha deve conter no mínimo 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const res = await userService.login(email, senha);
      setData(res);

      if (res && res.data?.token) {
        setToken(res.data.token);
        setMsg('Login efetuado com sucesso!');
      } else {
        setMsg('Falha ao obter dados de acesso.');
      }
    } catch (err) {
      setMsg('Login ou senha incorretos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = msg.includes('sucesso');

  if (!isHydrated) {
    return null;
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.logoMark}>
            <span style={styles.logoIcon}>🎱</span>
          </div>
          <h1 style={styles.title}>Funasinuca</h1>
          <p style={styles.subtitle}>Bem-vindo de volta</p>
        </div>

        {/* Form */}
        <form onSubmit={realizarLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              E-mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="seu@email.com"
              style={styles.input}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#F5C518';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(245,197,24,0.18)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#E5E5E5';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label htmlFor="password" style={styles.label}>
                Senha
              </label>
              <a href="#" style={styles.forgotLink}>
                Esqueceu?
              </a>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength={8}
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#F5C518';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(245,197,24,0.18)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#E5E5E5';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background = '#E0B400';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = '#F5C518';
            }}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner} /> Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Feedback message */}
        {msg && (
          <div
            style={{
              ...styles.message,
              background: isSuccess ? '#F0FFF4' : '#FFF5F5',
              borderColor: isSuccess ? '#68D391' : '#FC8181',
              color: isSuccess ? '#276749' : '#9B2C2C',
            }}
          >
            <span>{isSuccess ? '✓' : '✕'}</span>
            {msg}
          </div>
        )}

        {/* Footer */}
        <p style={styles.footer}>
          Não tem conta?{' '}
          <a href="/register" style={styles.footerLink}>
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F9F9F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Geist', 'DM Sans', 'Inter', sans-serif",
    padding: '1.5rem',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #EBEBEB',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoMark: {
    width: '56px',
    height: '56px',
    background: '#F5C518',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  logoIcon: {
    fontSize: '26px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111111',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#444444',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#888888',
    textDecoration: 'none',
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1.5px solid #E5E5E5',
    borderRadius: '10px',
    outline: 'none',
    background: '#FAFAFA',
    color: '#111111',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '0.25rem',
    padding: '12px',
    background: '#F5C518',
    color: '#111111',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    transition: 'background 0.15s, transform 0.1s',
    width: '100%',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #11111133',
    borderTopColor: '#111111',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  message: {
    marginTop: '1rem',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 500,
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888888',
    marginTop: '1.5rem',
    marginBottom: 0,
  },
  footerLink: {
    color: '#111111',
    fontWeight: 600,
    textDecoration: 'none',
    borderBottom: '1.5px solid #F5C518',
    paddingBottom: '1px',
  },
};
