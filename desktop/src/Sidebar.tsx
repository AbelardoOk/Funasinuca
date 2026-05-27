import './Sidebar.css';

export type ActiveTab = 'dashboard' | 'usuarios' | 'reservas' | 'mesas';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';
}

export function Sidebar({ activeTab, setActiveTab, userRole }: SidebarProps) {
  const isAdminOrStaff = userRole === 'ADMINISTRADOR' || userRole === 'FUNCIONARIO';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>Funasinuca</h2>
        <span className="role-indicator">{userRole}</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="menu-icon">📊</span> Dashboard & Agenda
        </button>

        {isAdminOrStaff && (
          <>
            <div className="menu-divider">Gerenciamento Base</div>

            <button
              className={`menu-item ${activeTab === 'reservas' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservas')}
            >
              <span className="menu-icon">📅</span> Todas as Reservas
            </button>

            <button
              className={`menu-item ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('usuarios')}
            >
              <span className="menu-icon">👥</span> Controle de Usuários
            </button>

            <button
              className={`menu-item ${activeTab === 'mesas' ? 'active' : ''}`}
              onClick={() => setActiveTab('mesas')}
            >
              <span className="menu-icon">🎱</span> Estrutura de Mesas
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
