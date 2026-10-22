import { useEffect, useState } from 'react';
import { api } from '../api';

// Status pills: marigold for open, aubergine for in progress, muted for resolved
const STATUS_STYLES = {
  Open: { color: '#3A0F34', background: 'rgba(234, 170, 0, 0.25)' },
  'In Progress': { color: '#3A0F34', background: 'rgba(58, 15, 52, 0.12)' },
  Resolved: { color: 'rgba(58, 15, 52, 0.6)', background: 'rgba(58, 15, 52, 0.06)' },
};

function Dashboard() {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.getResidents().then(setResidents).catch(console.error);
    api.getApartments().then(setApartments).catch(console.error);
    api.getComplaints().then(setComplaints).catch(console.error);
    api.getPayments().then(setPayments).catch(console.error);
    api.getNotices().then(setNotices).catch(console.error);
  }, []);

  const openComplaints = complaints.filter((c) => c.complaint_status !== 'Resolved');
  const pendingPayments = payments.filter((p) => p.payment_status === 'Pending');
  const completedCount = payments.length - pendingPayments.length;
  const collectedPercent = payments.length
    ? Math.round((completedCount / payments.length) * 100)
    : 0;

  const residentName = (id) => {
    const r = residents.find((x) => x.resident_id === id);
    return r ? r.resident_name : `Resident #${id}`;
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Stat accents: aubergine for most, marigold only on the one that needs attention
  const stats = [
    { label: 'Residents', value: residents.length, accent: '#3A0F34' },
    { label: 'Apartments', value: apartments.length, accent: '#3A0F34' },
    { label: 'Open Complaints', value: openComplaints.length, accent: '#EAAA00' },
    { label: 'Pending Payments', value: pendingPayments.length, accent: '#3A0F34' },
  ];

  const recentComplaints = [...complaints].reverse().slice(0, 6);
  const recentNotices = [...notices].reverse().slice(0, 5);

  return (
    <div>
      <p className="subtitle">{today}</p>

      <div className="stats">
        {stats.map((s) => (
          <div className="stat-card" key={s.label} style={{ '--accent': s.accent }}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card progress-card">
        <div className="card-title">Payments collected</div>
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${collectedPercent}%` }} />
          </div>
          <span className="progress-text">
            {completedCount} of {payments.length} ({collectedPercent}%)
          </span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Recent complaints</div>
          {recentComplaints.length === 0 && <p className="empty">No complaints yet</p>}
          {recentComplaints.map((c) => {
            const style = STATUS_STYLES[c.complaint_status] || STATUS_STYLES.Resolved;
            return (
              <div className="row" key={c.complaint_id}>
                <div>
                  <div className="row-title">{c.complaint_type}</div>
                  <div className="row-sub">{residentName(c.resident_id)} · {c.description}</div>
                </div>
                <span className="pill" style={style}>
                  {c.complaint_status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">Latest notices</div>
          {recentNotices.length === 0 && <p className="empty">No notices yet</p>}
          {recentNotices.map((n) => (
            <div className="row" key={n.notice_id}>
              <div>
                <div className="row-title">{n.notice_title}</div>
                <div className="row-sub">{n.notice_data}</div>
              </div>
              <span className="row-date">{String(n.notice_date).slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;