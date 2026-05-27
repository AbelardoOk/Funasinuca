import { useEffect, useState } from 'react';
import './App.css';
import { Dashboard } from './Dashboard';
import { userService } from './lib/api/endpoints/users';
import { TipoUsuario } from './lib/api/types/api';

interface LoginProps {
  onLoginSuccess: (nome: string, role: TipoUsuario) => void;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<TipoUsuario>('CLIENTE');

  useEffect(() => {
    const validarToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const isLogged = await userService.validate(token);

          if (isLogged.ok && isLogged.data?.ok) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error('Erro ao validar token:', e);
          setIsLoggedIn(false);
        }
      }
    };

    validarToken();
  }, []);

  return (
    <main className="container">
      {!isLoggedIn ? (
        <Login
          onLoginSuccess={(nome, role) => {
            setUserName(nome);
            setUserRole(role);
            setIsLoggedIn(true);
          }}
        />
      ) : (
        <Dashboard
          onLogout={() => {
            setIsLoggedIn(false);
            localStorage.removeItem('token');
          }}
          userName={userName}
          userRole={userRole}
        />
      )}
    </main>
  );
}
export function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  // os estados comuns
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('');

  // para o registro
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página no submit
    setStatus('Autenticando...');

    try {
      const response = await userService.login(email, senha);

      console.log('Resposta do Rust via userService:', response);

      if (response.ok) {
        // Se a sua API retorna um token, salvamos aqui
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        const nomeDoBackend = response.data?.userName || 'Usuário';
        const cargoDoBackend = response.data?.userRole || 'CLIENTE';

        onLoginSuccess(nomeDoBackend, cargoDoBackend);
      } else {
        setStatus(response.error || 'Dados incorretos');
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setStatus('Erro técnico na comunicação.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setStatus('As senhas não coincidem.');
      return;
    }

    // Validação visual rápida para os 11 dígitos do schema
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setStatus('O CPF precisa ter 11 números.');
      return;
    }

    setStatus('Criando conta...');

    try {
      const response = await userService.register(nome, cpfLimpo, email, senha);

      if (response.ok) {
        setStatus('Conta criada com sucesso! Faça o login.');
        setSenha('');
        setIsRegistering(false);
      } else {
        setStatus(response.error || 'Falha ao criar conta.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setStatus('Erro técnico na comunicação.');
    }
  };
  return (
    <div className="login-container">
      {/* O formulário muda dependendo do estado isRegistering */}
      {isRegistering ? (
        <form onSubmit={handleRegister} className="login-box">
          <h2>Criar Conta</h2>
          <input
            type="text"
            placeholder="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="CPF (apenas números)"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            maxLength={14}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <button type="submit">Finalizar Cadastro</button>

          <button type="button" className="link-button" onClick={() => setIsRegistering(false)}>
            Já tem uma conta? Voltar para Login
          </button>
          <p className="status-message">{status}</p>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="login-box">
          <h2>Entrar</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
          />
          <button type="submit">Entrar no Sistema</button>

          <button type="button" className="link-button" onClick={() => setIsRegistering(true)}>
            Novo por aqui? Criar conta
          </button>
          <p className="status-message">{status}</p>
        </form>
      )}
    </div>
  );
}

export default App;
