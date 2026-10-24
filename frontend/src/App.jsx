import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Receipt,
  AlertTriangle,
  CreditCard,
  Bell,
  Menu,
  X,
  UserRound,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ResidentsPage from './components/ResidentsPage';
import ApartmentsPage from './components/ApartmentsPage';
import BillsPage from './components/BillsPage';
import ComplaintsPage from './components/ComplaintsPage';
import PaymentsPage from './components/PaymentsPage';
import NoticesPage from './components/NoticesPage';
import ResidentPortal, { ResidentLogin } from './components/ResidentPortal';

const pages = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, Component: Dashboard },
  residents: { label: 'Residents', icon: Users, Component: ResidentsPage },
  apartments: { label: 'Apartments', icon: Building2, Component: ApartmentsPage },
  bills: { label: 'Bills', icon: Receipt, Component: BillsPage },
  complaints: { label: 'Complaints', icon: AlertTriangle, Component: ComplaintsPage },
  payments: { label: 'Payments', icon: CreditCard, Component: PaymentsPage },
  notices: { label: 'Notices', icon: Bell, Component: NoticesPage },
};

function App() {
  const [mode, setMode] = useState('admin');
  const [portalUser, setPortalUser] = useState(null);
  const [current, setCurrent] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  if (mode === 'resident') {
    if (!portalUser) {
      return <ResidentLogin onPick={setPortalUser} onBack={() => setMode('admin')} />;
    }
    return (
      <ResidentPortal
        resident={portalUser}
        onLogout={() => {
          setPortalUser(null);
          setMode('admin');
        }}
      />
    );
  }

  const { label, Component } = pages[current];

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <Building2 size={24} strokeWidth={1.75} />
          </span>
          <span className="brand-text">Dwella</span>
        </div>

        <nav>
          {Object.entries(pages).map(([key, page]) => {
            const Icon = page.icon;
            return (
              <button
                key={key}
                title={page.label}
                className={`nav-item ${current === key ? 'active' : ''}`}
                onClick={() => setCurrent(key)}
              >
                <Icon size={18} strokeWidth={1.75} className="nav-icon" />
                <span className="nav-label">{page.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="nav-item" onClick={() => setMode('resident')} style={{ marginTop: 16 }}>
          <UserRound size={18} strokeWidth={1.75} className="nav-icon" />
          <span className="nav-label">Resident portal</span>
        </button>
      </aside>

      <main className="main">
        <div className="page-header">
          <div className="page-header-row">
            <button
              className="icon-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            <h1>{label}</h1>
          </div>
        </div>
        <Component />
      </main>
    </div>
  );
}

export default App;