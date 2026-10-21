import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { resident_id: '', notice_title: '', notice_data: '', notice_date: '' };

function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadNotices = () => {
    api.getNotices().then(setNotices).catch(() => setMessage('Could not load notices'));
  };

  useEffect(() => {
    loadNotices();
    api.getResidents().then(setResidents).catch(() => setMessage('Could not load residents'));
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
    const payload = { ...form, resident_id: parseInt(form.resident_id, 10) };
    try {
      if (editingId) {
        await api.updateNotice(editingId, payload);
        setMessage('Notice updated!');
      } else {
        await api.createNotice(payload);
        setMessage('Notice added!');
      }
      resetForm();
      loadNotices();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (n) => {
    setEditingId(n.notice_id);
    setForm({
      resident_id: String(n.resident_id),
      notice_title: n.notice_title,
      notice_data: n.notice_data,
      notice_date: String(n.notice_date).slice(0, 10),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteNotice(id);
      setMessage('Notice deleted!');
      loadNotices();
    } catch {
      setMessage('Could not delete notice');
    }
  };

  const residentName = (id) => {
    const r = residents.find((x) => x.resident_id === id);
    return r ? r.resident_name : id;
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Notice' : 'Add Notice'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="resident_id" value={form.resident_id} onChange={handleChange} required>
          <option value="">Select resident</option>
          {residents.map((r) => (
            <option key={r.resident_id} value={r.resident_id}>{r.resident_name}</option>
          ))}
        </select>{' '}
        <input name="notice_title" placeholder="Title" value={form.notice_title} onChange={handleChange} required />{' '}
        <input name="notice_data" placeholder="Notice details" value={form.notice_data} onChange={handleChange} required />{' '}
        <input name="notice_date" type="date" value={form.notice_date} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Notices ({notices.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Resident</th><th>Title</th><th>Details</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.notice_id}>
              <td>{n.notice_id}</td>
              <td>{residentName(n.resident_id)}</td>
              <td>{n.notice_title}</td>
              <td>{n.notice_data}</td>
              <td>{String(n.notice_date).slice(0, 10)}</td>
              <td>
                <button onClick={() => handleEdit(n)}>Edit</button>{' '}
                <button onClick={() => handleDelete(n.notice_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NoticesPage;