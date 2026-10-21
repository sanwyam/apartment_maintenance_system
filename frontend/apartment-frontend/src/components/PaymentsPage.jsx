import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  resident_id: '',
  bill_id: '',
  payment_date: '',
  payment_mode: '',
  payment_status: 'Pending',
};

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadPayments = () => {
    api.getPayments().then(setPayments).catch(() => setMessage('Could not load payments'));
  };

  useEffect(() => {
    loadPayments();
    api.getResidents().then(setResidents).catch(() => setMessage('Could not load residents'));
    api.getBills().then(setBills).catch(() => setMessage('Could not load bills'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      resident_id: parseInt(form.resident_id, 10),
      bill_id: parseInt(form.bill_id, 10),
      payment_date: form.payment_date,
      payment_mode: form.payment_mode,
      payment_status: form.payment_status,
    };
    try {
      if (editingId) {
        await api.updatePayment(editingId, payload);
        setMessage('Payment updated!');
      } else {
        await api.createPayment(payload);
        setMessage('Payment added!');
      }
      resetForm();
      loadPayments();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.payment_id);
    setForm({
      resident_id: String(p.resident_id),
      bill_id: String(p.bill_id),
      payment_date: String(p.payment_date).slice(0, 10),
      payment_mode: p.payment_mode,
      payment_status: p.payment_status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deletePayment(id);
      setMessage('Payment deleted!');
      loadPayments();
    } catch {
      setMessage('Could not delete payment');
    }
  };

  const residentName = (id) => {
    const r = residents.find((x) => x.resident_id === id);
    return r ? r.resident_name : id;
  };

  const billLabel = (id) => {
    const b = bills.find((x) => x.bill_id === id);
    return b ? `${b.bill_month} - ₹${b.bill_amount}` : id;
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Payment' : 'Add Payment'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="resident_id" value={form.resident_id} onChange={handleChange} required>
          <option value="">Select resident</option>
          {residents.map((r) => (
            <option key={r.resident_id} value={r.resident_id}>{r.resident_name}</option>
          ))}
        </select>{' '}
        <select name="bill_id" value={form.bill_id} onChange={handleChange} required>
          <option value="">Select bill</option>
          {bills.map((b) => (
            <option key={b.bill_id} value={b.bill_id}>
              {b.bill_month} - ₹{b.bill_amount}
            </option>
          ))}
        </select>{' '}
        <input name="payment_date" type="date" value={form.payment_date} onChange={handleChange} required />{' '}
        <select name="payment_mode" value={form.payment_mode} onChange={handleChange} required>
          <option value="">Select mode</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online">Online</option>
          <option value="Cheque">Cheque</option>
          <option value="Cash">Cash</option>
        </select>{' '}
        <select name="payment_status" value={form.payment_status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Payments ({payments.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Resident</th><th>Bill</th><th>Date</th><th>Mode</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.payment_id}>
              <td>{p.payment_id}</td>
              <td>{residentName(p.resident_id)}</td>
              <td>{billLabel(p.bill_id)}</td>
              <td>{String(p.payment_date).slice(0, 10)}</td>
              <td>{p.payment_mode}</td>
              <td>{p.payment_status}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>{' '}
                <button onClick={() => handleDelete(p.payment_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentsPage;