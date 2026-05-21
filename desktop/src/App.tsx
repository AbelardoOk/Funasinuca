import { useState } from "react";
import { userService } from "./lib/api/endpoints/users";
import "./App.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main className="container">
      <h1>Sistema de Gestão Funasinuca</h1>
      
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <div>
          <h2>Bem-vindo ao Dashboard!</h2>
          <button onClick={() => setIsLoggedIn(false)}>Sair</button>
        </div>
      )}
    </main>
  );
}
export function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  // os estados comuns
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("");

  // para o registro 
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página no submit
    setStatus("Autenticando...");

    try {
      const response = await userService.login(email, senha);
      
      console.log("Resposta do Rust via userService:", response);

      if (response.ok) {
        // Se a sua API retorna um token, salvamos aqui
        if (response.data?.token) {
           localStorage.setItem("token", response.data.token);
        }
        onLoginSuccess();
      } else {
        setStatus(response.error || "Dados incorretos");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      setStatus("Erro técnico na comunicação.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {
      setStatus("As senhas não coincidem.");
      return;
    }
    
    // Validação visual rápida para os 11 dígitos do schema
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setStatus("O CPF precisa ter 11 números.");
      return;
    }

    setStatus("Criando conta...");

    try {
      const response = await userService.register( nome, cpfLimpo, email, senha );
      
      if (response.ok) {
        setStatus("Conta criada com sucesso! Faça o login.");
        setSenha("");
        setIsRegistering(false); 
      } else {
        setStatus(response.error || "Falha ao criar conta.");
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setStatus("Erro técnico na comunicação.");
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