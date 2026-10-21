import { useEffect, useState } from 'react';
import { api } from '../api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEARS = [2024, 2025, 2026, 2027];

const emptyForm = { apartment_id: '', bill_month: '', bill_year: '', due_date: '', bill_amount: '' };

function BillsPage() {
  const [bills, setBills] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadBills = () => {
    api.getBills().then(setBills).catch(() => setMessage('Could not load bills'));
  };

  useEffect(() => {
    loadBills();
    api.getApartments().then(setApartments).catch(() => setMessage('Could not load apartments'));
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
      apartment_id: parseInt(form.apartment_id, 10),
      bill_month: `${form.bill_month} ${form.bill_year}`,
      due_date: form.due_date,
      bill_amount: parseFloat(form.bill_amount),
    };
    try {
      if (editingId) {
        await api.updateBill(editingId, payload);
        setMessage('Bill updated!');
      } else {
        await api.createBill(payload);
        setMessage('Bill added!');
      }
      resetForm();
      loadBills();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.bill_id);
    const [month, year] = b.bill_month.split(' ');
    setForm({
      apartment_id: String(b.apartment_id),
      bill_month: month,
      bill_year: year,
      due_date: String(b.due_date).slice(0, 10),
      bill_amount: String(b.bill_amount),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteBill(id);
      setMessage('Bill deleted!');
      loadBills();
    } catch {
      setMessage('Could not delete bill');
    }
  };

  const flatName = (apartmentId) => {
    const a = apartments.find((x) => x.apartment_id === apartmentId);
    return a ? `${a.flat_number} (Block ${a.block_number})` : apartmentId;
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Bill' : 'Add Bill'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="apartment_id" value={form.apartment_id} onChange={handleChange} required>
          <option value="">Select apartment</option>
          {apartments.map((a) => (
            <option key={a.apartment_id} value={a.apartment_id}>
              {a.flat_number} (Block {a.block_number})
            </option>
          ))}
        </select>{' '}
        <select name="bill_month" value={form.bill_month} onChange={handleChange} required>
          <option value="">Select month</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>{' '}
        <select name="bill_year" value={form.bill_year} onChange={handleChange} required>
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>{' '}
        <input name="due_date" type="date" value={form.due_date} onChange={handleChange} required />{' '}
        <input name="bill_amount" type="number" step="0.01" placeholder="Amount" value={form.bill_amount} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Bills ({bills.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Apartment</th><th>Month</th><th>Due Date</th><th>Amount</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.bill_id}>
              <td>{b.bill_id}</td>
              <td>{flatName(b.apartment_id)}</td>
              <td>{b.bill_month}</td>
              <td>{String(b.due_date).slice(0, 10)}</td>
              <td>₹{b.bill_amount}</td>
              <td>
                <button onClick={() => handleEdit(b)}>Edit</button>{' '}
                <button onClick={() => handleDelete(b.bill_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BillsPage;