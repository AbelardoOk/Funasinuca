import { useEffect, useState } from 'react';
import { userService } from './lib/api/endpoints/users';
import { TipoUsuario, UpdateUsuarioPayload, Usuario } from './lib/api/types';

interface UsersManagementProps {
  userRole: TipoUsuario;
}

export function UsersManagement({ userRole }: UsersManagementProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Estados para edição inline
  const [idLinhaEmEdicao, setIdLinhaEmEdicao] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<TipoUsuario>('CLIENTE');

  // 🚀 Estados para seleção em massa
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([]);

  const isAdmin = userRole === 'ADMINISTRADOR';

  const carregarUsuarios = async () => {
    setLoading(true);
    const response = await userService.getAll();
    if (response.ok && response.data) {
      setUsuarios(response.data);
    }
    setLoading(false);
    setUsuariosSelecionados([]); // Limpa seleção ao recarregar
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleIniciarEdicao = (user: Usuario) => {
    setIdLinhaEmEdicao(user.id);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditRole(user.tipo || 'CLIENTE'); //
  };

  const handleSalvarEdicao = async (userId: string) => {
    if (!editNome.trim() || !editEmail.trim()) {
      alert('Nome e E-mail não podem ficar em branco.');
      return;
    }

    try {
      const payload: UpdateUsuarioPayload = {
        nome: editNome,
        email: editEmail,
        role: editRole,
      };

      const response = await userService.update(userId, payload);

      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        setIdLinhaEmEdicao(null);
        await carregarUsuarios();
      } else {
        alert(response.message || 'Erro ao atualizar dados do usuário.');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // 🚀 Ação em massa: Exclusão múltipla
  const handleExclusaoEmMassa = async () => {
    if (!isAdmin) return;
    const qtd = usuariosSelecionados.length;
    if (qtd === 0) return;

    if (
      !window.confirm(
        `Tem certeza que deseja remover permanentemente os ${qtd} usuários selecionados?`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Executa as promessas de exclusão em paralelo
      const promessas = usuariosSelecionados.map((id) => userService.delete(id));
      await Promise.all(promessas);

      alert(`${qtd} usuários excluídos com sucesso!`);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro na exclusão em massa:', error);
      alert('Ocorreu um erro ao tentar excluir um ou mais usuários.');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Ação em massa: Desativação múltipla (altera o cargo para CLIENTE por segurança ou envia flag específica)
  const handleDesativarEmMassa = async () => {
    const qtd = usuariosSelecionados.length;
    if (qtd === 0) return;

    if (!window.confirm(`Deseja desativar as contas de acesso dos ${qtd} usuários selecionados?`)) {
      return;
    }

    setLoading(true);
    try {
      // Como o seu backend atualiza via payload, simulamos uma desativação limpando privilégios estritos
      const promessas = usuariosSelecionados.map((id) =>
        userService.update(id, { role: 'CLIENTE' }),
      );
      await Promise.all(promessas);

      alert(`${qtd} contas desativadas/rebaixadas para cliente com sucesso!`);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao desativar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Controle de seleção individual
  const handleAlternarSelecaoUsuario = (userId: string) => {
    setUsuariosSelecionados((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  // 🚀 Controle de seleção total da página atual
  const handleAlternarSelecaoTodos = (usuariosPagina: Usuario[]) => {
    const todosSelecionados = usuariosPagina.every((u) => usuariosSelecionados.includes(u.id));
    if (todosSelecionados) {
      // Desmarca todos da página atual
      const idsPagina = usuariosPagina.map((u) => u.id);
      setUsuariosSelecionados((prev) => prev.filter((id) => !idsPagina.includes(id)));
    } else {
      // Marca todos da página atual sem duplicar
      const novosIds = usuariosPagina
        .map((u) => u.id)
        .filter((id) => !usuariosSelecionados.includes(id));
      setUsuariosSelecionados((prev) => [...prev, ...novosIds]);
    }
  };

  const handleCriarNovoUsuario = () => {
    // Integração futura com modal de criação ou redirecionamento de cadastro do balcão
    const nome = prompt('Nome do novo usuário:');
    if (!nome) return;
    const cpf = prompt('CPF do usuário (apenas números):');
    if (!cpf) return;
    const email = prompt('E-mail do usuário:');
    if (!email) return;
    const senha = prompt('Senha inicial:');
    if (!senha) return;

    userService.register(nome, cpf, email, senha).then((res) => {
      if (res.ok) {
        alert('Usuário criado com sucesso no banco!');
        carregarUsuarios();
      } else {
        alert(res.message || 'Erro ao registrar usuário.');
      }
    });
  };

  const formatarCPF = (cpfCru: string) => {
    if (!cpfCru) return 'Não informado';
    const apenasNumeros = cpfCru.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return cpfCru;
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      (u.cpf && u.cpf.includes(busca)),
  );

  return (
    <div className="management-panel animate-fade-in">
      <div className="panel-header">
        <div>
          <h1>Controle de Usuários</h1>
          <p>Gerencie as credenciais, permissões e dados cadastrais dos clientes e funcionários.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 🚀 Botão adicionar usuário */}
          <button
            className="btn-create-reservation"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            onClick={handleCriarNovoUsuario}
          >
            Criar Usuário
          </button>
          <button className="btn-refresh" onClick={carregarUsuarios}>
            Atualizar
          </button>
        </div>
      </div>

      {/* 🚀 Toolbar Dinâmica Contextual */}
      <div
        className="panel-actions"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '48px',
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
          style={{ flexGrow: 1, maxWidth: '400px' }}
        />

        {usuariosSelecionados.length > 0 && (
          <div
            className="toolbar-mass-actions"
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '6px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              {usuariosSelecionados.length} selecionado(s)
            </span>
            <button
              className="btn-quick-action"
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569' }}
              onClick={handleDesativarEmMassa}
            >
              Desativar
            </button>
            {isAdmin && (
              <button className="btn-quick-action btn-quick-danger" onClick={handleExclusaoEmMassa}>
                Excluir
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Buscando registros no banco de dados...</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {/* 🚀 Checkbox de Seleção Geral */}
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={
                      usuariosFiltrados.length > 0 &&
                      usuariosFiltrados.every((u) => usuariosSelecionados.includes(u.id))
                    }
                    onChange={() => handleAlternarSelecaoTodos(usuariosFiltrados)}
                  />
                </th>
                <th>Nome Completo</th>
                <th>E-mail</th>
                {isAdmin && <th>CPF</th>}
                <th>Nível de Acesso</th>
                <th>ID do Sistema</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="table-empty">
                    Nenhum usuário localizado.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr
                    key={user.id}
                    className={usuariosSelecionados.includes(user.id) ? 'row-selected' : ''}
                    style={{
                      backgroundColor: usuariosSelecionados.includes(user.id)
                        ? '#f8fafc'
                        : 'transparent',
                    }}
                  >
                    {/* 🚀 Checkbox Individual */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={usuariosSelecionados.includes(user.id)}
                        onChange={() => handleAlternarSelecaoUsuario(user.id)}
                        disabled={idLinhaEmEdicao === user.id}
                      />
                    </td>

                    {/* NOME */}
                    <td>
                      {idLinhaEmEdicao === user.id ? (
                        <input
                          type="text"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                          }}
                        />
                      ) : (
                        <strong>{user.nome}</strong>
                      )}
                    </td>

                    {/* E-MAIL */}
                    <td>
                      {idLinhaEmEdicao === user.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                          }}
                        />
                      ) : (
                        user.email
                      )}
                    </td>

                    {/* CPF */}
                    {isAdmin && (
                      <td className="text-monospace" style={{ letterSpacing: '0.5px' }}>
                        {formatarCPF(user.cpf)}
                      </td>
                    )}

                    {/* NÍVEL DE ACESSO */}
                    <td>
                      {idLinhaEmEdicao === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as TipoUsuario)}
                          className="modal-select"
                          style={{ padding: '4px', fontSize: '0.85rem' }}
                        >
                          <option value="CLIENTE">CLIENTE</option>
                          <option value="FUNCIONARIO">FUNCIONARIO</option>
                          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                        </select>
                      ) : (
                        <span
                          className={`role-badge role-${(user.tipo || 'CLIENTE').toLowerCase()}`}
                        >
                          {user.tipo || 'CLIENTE'}
                        </span>
                      )}
                    </td>

                    {/* ID DO SISTEMA */}
                    <td className="text-muted text-monospace">{user.id}</td>

                    {/* CONTROLES DE EDIÇÃO (Acessível por todos os autorizados a ver a tabela, mas ações de exclusão sumiram daqui) */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {idLinhaEmEdicao === user.id ? (
                          <>
                            <button
                              onClick={() => handleSalvarEdicao(user.id)}
                              className="btn-quick-action btn-quick-success"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setIdLinhaEmEdicao(null)}
                              className="btn-quick-action"
                              style={{ background: '#e2e8f0', color: '#334155' }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleIniciarEdicao(user)}
                            className="btn-edit"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
