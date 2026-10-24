import { useEffect, useState } from 'react';
import { Home, ReceiptText, Wallet, AlertTriangle, Bell, Building2 } from 'lucide-react';
import { api } from '../api';
import Receipt from './Receipt';

const TABS = {
  home: { label: 'Home', icon: Home },
  bills: { label: 'Bills', icon: ReceiptText },
  receipts: { label: 'Receipts', icon: Wallet },
  complaints: { label: 'Complaints', icon: AlertTriangle },
  notices: { label: 'Notices', icon: Bell },
  apartment: { label: 'My Apartment', icon: Building2 },
};

const COMPLAINT_TYPES = ['Plumbing', 'Electrical', 'Maintenance', 'Noise', 'Pest Control', 'Other'];

const STATUS_CLASS = {
  Open: 'pill-open',
  'In Progress': 'pill-progress',
  Resolved: 'pill-resolved',
};

const money = (n) => `₹${Number(n).toFixed(2)}`;
const date = (d) => String(d).slice(0, 10);
const emptyComplaint = { complaint_type: '', description: '' };

function ResidentPortal({ resident, onLogout }) {
  const [tab, setTab] = useState('home');
  const [apartment, setApartment] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [receiptId, setReceiptId] = useState(null);
  const [complaintForm, setComplaintForm] = useState(emptyComplaint);
  const [message, setMessage] = useState('');

  const id = resident.resident_id;

  const loadComplaints = () => {
    api.getComplaintsForResident(id).then(setComplaints).catch(() => setMessage('Could not load complaints'));
  };

  useEffect(() => {
    api.getResidentApartments(id)
      .then((rows) => {
        const apt = rows[0] || null;
        setApartment(apt);
        if (apt) {
          api.getBillsForApartment(apt.apartment_id)
            .then(setBills)
            .catch(() => setMessage('Could not load bills'));
        }
      })
      .catch(() => setMessage('Could not load your apartment'));

    api.getPaymentsForResident(id).then(setPayments).catch(() => setMessage('Could not load payments'));
    api.getNoticesForResident(id).then(setNotices).catch(() => setMessage('Could not load notices'));
    api.getComplaintsForResident(id).then(setComplaints).catch(() => setMessage('Could not load complaints'));
  }, [id]);

  const completedPayments = payments.filter((p) => p.payment_status === 'Completed');
  const paidBillIds = new Set(completedPayments.map((p) => p.bill_id));
  const dueBills = bills.filter((b) => !paidBillIds.has(b.bill_id));
  const amountDue = dueBills.reduce((sum, b) => sum + Number(b.bill_amount), 0);
  const openComplaints = complaints.filter((c) => c.complaint_status !== 'Resolved');

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        resident_id: id,
        complaint_type: complaintForm.complaint_type,
        description: complaintForm.description,
        complaint_status: 'Open',
      });
      setComplaintForm(emptyComplaint);
      setMessage('Complaint submitted');
      loadComplaints();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const switchTab = (key) => {
    setTab(key);
    setReceiptId(null);
    setMessage('');
  };

  const renderTab = () => {
    if (tab === 'home') {
      return (
        <>
          <div className="stats">
            <div className={`stat-card ${dueBills.length > 0 ? 'attention' : ''}`}>
              <div className="stat-value">{money(amountDue)}</div>
              <div className="stat-label">Amount due</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{completedPayments.length}</div>
              <div className="stat-label">Payments made</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{openComplaints.length}</div>
              <div className="stat-label">Open complaints</div>
            </div>
          </div>

          <h2>Latest notices</h2>
          {notices.length === 0 && <p className="empty">No notices yet</p>}
          {[...notices].reverse().slice(0, 3).map((n) => (
            <div className="card" key={n.notice_id}>
              <div className="row-title">{n.notice_title}</div>
              <div className="row-sub">{n.notice_data}</div>
            </div>
          ))}
        </>
      );
    }

    if (tab === 'bills') {
      return (
        <>
          {bills.length === 0 && <p className="empty">No bills for your apartment yet</p>}
          {bills.length > 0 && (
            <table>
              <thead>
                <tr><th>Month</th><th>Due date</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const paid = paidBillIds.has(b.bill_id);
                  return (
                    <tr key={b.bill_id}>
                      <td>{b.bill_month}</td>
                      <td>{date(b.due_date)}</td>
                      <td>{money(b.bill_amount)}</td>
                      <td>
                        <span className={`pill ${paid ? 'pill-paid' : 'pill-open'}`}>
                          {paid ? 'Paid' : 'Due'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      );
    }

    if (tab === 'receipts') {
      return (
        <>
          {receiptId && <Receipt paymentId={receiptId} onClose={() => setReceiptId(null)} />}
          {completedPayments.length === 0 && <p className="empty">No receipts yet</p>}
          {completedPayments.length > 0 && (
            <table>
              <thead>
                <tr><th>Payment date</th><th>Mode</th><th>Bill</th><th>Receipt</th></tr>
              </thead>
              <tbody>
                {completedPayments.map((p) => {
                  const bill = bills.find((b) => b.bill_id === p.bill_id);
                  return (
                    <tr key={p.payment_id}>
                      <td>{date(p.payment_date)}</td>
                      <td>{p.payment_mode}</td>
                      <td>{bill ? `${bill.bill_month} - ${money(bill.bill_amount)}` : `Bill #${p.bill_id}`}</td>
                      <td>
                        <button onClick={() => setReceiptId(p.payment_id)}>View receipt</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      );
    }

    if (tab === 'complaints') {
      return (
        <>
          <h2>Raise a complaint</h2>
          <form onSubmit={submitComplaint}>
            <select
              value={complaintForm.complaint_type}
              onChange={(e) => setComplaintForm({ ...complaintForm, complaint_type: e.target.value })}
              required
            >
              <option value="">Select type</option>
              {COMPLAINT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              placeholder="Describe the issue"
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              required
            />
            <button type="submit">Submit</button>
          </form>

          <h2>Your complaints</h2>
          {complaints.length === 0 && <p className="empty">No complaints yet</p>}
          {[...complaints].reverse().map((c) => (
            <div className="row" key={c.complaint_id}>
              <div>
                <div className="row-title">{c.complaint_type}</div>
                <div className="row-sub">{c.description}</div>
              </div>
              <span className={`pill ${STATUS_CLASS[c.complaint_status] || 'pill-resolved'}`}>
                {c.complaint_status}
              </span>
            </div>
          ))}
        </>
      );
    }

    if (tab === 'notices') {
      return (
        <>
          {notices.length === 0 && <p className="empty">No notices yet</p>}
          {[...notices].reverse().map((n) => (
            <div className="card" key={n.notice_id}>
              <div className="row-title">{n.notice_title}</div>
              <div className="row-sub">{n.notice_data}</div>
              <div className="row-date" style={{ marginTop: 8 }}>{date(n.notice_date)}</div>
            </div>
          ))}
        </>
      );
    }

    if (tab === 'apartment') {
      if (!apartment) return <p className="empty">No apartment linked to your account yet</p>;
      return (
        <div className="card">
          <div className="receipt-row"><span>Flat</span><span>{apartment.flat_number}</span></div>
          <div className="receipt-row"><span>Block</span><span>{apartment.block_number}</span></div>
          <div className="receipt-row"><span>Floor</span><span>{apartment.floor_number}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Building2 size={24} strokeWidth={1.75} /></span>
          <span className="brand-text">Dwella</span>
        </div>

        <nav>
          {Object.entries(TABS).map(([key, t]) => {
            const Icon = t.icon;
            return (
              <button
                key={key}
                title={t.label}
                className={`nav-item ${tab === key ? 'active' : ''}`}
                onClick={() => switchTab(key)}
              >
                <Icon size={18} strokeWidth={1.75} className="nav-icon" />
                <span className="nav-label">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="nav-item" onClick={onLogout} style={{ marginTop: 16 }}>
          <span className="nav-label">Sign out</span>
        </button>
      </aside>

      <main className="main">
        <div className="page-header">
          <h1>{TABS[tab].label}</h1>
        </div>
        <p className="subtitle">Signed in as {resident.resident_name}</p>

        {message && <p>{message}</p>}
        {renderTab()}
      </main>
    </div>
  );
}

export function ResidentLogin({ onPick, onBack }) {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getResidents().then(setResidents).catch(() => setError('Could not load residents'));
  }, []);

  return (
    <main className="main login">
      <h1>Dwella</h1>
      <p>Choose your name to continue</p>
      <div className="card login-list">
        {residents.map((r) => (
          <button key={r.resident_id} className="login-option" onClick={() => onPick(r)}>
            {r.resident_name}
          </button>
        ))}
      </div>
      {error && <p>{error}</p>}
      <button type="button" onClick={onBack} style={{ marginTop: 16 }}>Back to admin</button>
    </main>
  );
}

export default ResidentPortal;