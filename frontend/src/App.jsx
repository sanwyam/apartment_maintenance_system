import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ResidentsPage from './components/ResidentsPage';
import ApartmentsPage from './components/ApartmentsPage';
import BillsPage from './components/BillsPage';
import ComplaintsPage from './components/ComplaintsPage';
import PaymentsPage from './components/PaymentsPage';
import NoticesPage from './components/NoticesPage';

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
  const { label, Component } = pages[current];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Apartment Maintenance</div>
        <nav>
          {Object.entries(pages).map(([key, page]) => (
            <button
              key={key}
              className={`nav-item ${current === key ? 'active' : ''}`}
              onClick={() => setCurrent(key)}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="page-header">
          <h1>{label}</h1>
        </div>
        <Component />
      </main>
    </div>
  );
}

export default App;