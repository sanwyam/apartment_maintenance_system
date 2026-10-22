import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ResidentsPage from './components/ResidentsPage';
import ApartmentsPage from './components/ApartmentsPage';
import BillsPage from './components/BillsPage';
import ComplaintsPage from './components/ComplaintsPage';
import PaymentsPage from './components/PaymentsPage';
import NoticesPage from './components/NoticesPage';

// Minimal stroke icons, 18px, inherit color from the button
const Icon = ({ children }) => (
  <svg
    className="nav-icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),
  residents: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Icon>
  ),
  apartments: (
    <Icon>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </Icon>
  ),
  bills: (
    <Icon>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </Icon>
  ),
  complaints: (
    <Icon>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.5" />
    </Icon>
  ),
  payments: (
    <Icon>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Icon>
  ),
  notices: (
    <Icon>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Icon>
  ),
};

const pages = {
  dashboard: { label: 'Dashboard', Component: Dashboard },
  residents: { label: 'Residents', Component: ResidentsPage },
  apartments: { label: 'Apartments', Component: ApartmentsPage },
  bills: { label: 'Bills', Component: BillsPage },
  complaints: { label: 'Complaints', Component: ComplaintsPage },
  payments: { label: 'Payments', Component: PaymentsPage },
  notices: { label: 'Notices', Component: NoticesPage },
};

function App() {
  const [current, setCurrent] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { label, Component } = pages[current];

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          <span className="brand-text">Apartment Maintenance</span>
          <svg
            className="brand-mark"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EAAA00"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Apartment Maintenance"
          >
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </div>
        <nav>
          {Object.entries(pages).map(([key, page]) => (
            <button
              key={key}
              title={page.label}
              className={`nav-item ${current === key ? 'active' : ''}`}
              onClick={() => setCurrent(key)}
            >
              {icons[key]}
              <span className="nav-label">{page.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="page-header">
          <div className="header-row">
            <button
              className={`menu-toggle ${collapsed ? '' : 'open'}`}
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
              aria-expanded={!collapsed}
            >
              <span />
              <span />
              <span />
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