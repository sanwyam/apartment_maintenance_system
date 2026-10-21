import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { resident_id: '', complaint_type: '', description: '', complaint_status: 'Open' };

function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadComplaints = () => {
    api.getComplaints().then(setComplaints).catch(() => setMessage('Could not load complaints'));
  };

  useEffect(() => {
    loadComplaints();
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
        await api.updateComplaint(editingId, payload);
        setMessage('Complaint updated!');
      } else {
        await api.createComplaint(payload);
        setMessage('Complaint added!');
      }
      resetForm();
      loadComplaints();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.complaint_id);
    setForm({
      resident_id: String(c.resident_id),
      complaint_type: c.complaint_type,
      description: c.description,
      complaint_status: c.complaint_status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteComplaint(id);
      setMessage('Complaint deleted!');
      loadComplaints();
    } catch {
      setMessage('Could not delete complaint');
    }
  };

  const residentName = (id) => {
    const r = residents.find((x) => x.resident_id === id);
    return r ? r.resident_name : id;
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Complaint' : 'Add Complaint'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="resident_id" value={form.resident_id} onChange={handleChange} required>
          <option value="">Select resident</option>
          {residents.map((r) => (
            <option key={r.resident_id} value={r.resident_id}>{r.resident_name}</option>
          ))}
        </select>{' '}
        <select name="complaint_type" value={form.complaint_type} onChange={handleChange} required>
          <option value="">Select type</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Noise">Noise</option>
          <option value="Pest Control">Pest Control</option>
          <option value="Other">Other</option>
        </select>{' '}
        <select name="complaint_status" value={form.complaint_status} onChange={handleChange}>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>{' '}
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Complaints ({complaints.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Resident</th><th>Type</th><th>Description</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.complaint_id}>
              <td>{c.complaint_id}</td>
              <td>{residentName(c.resident_id)}</td>
              <td>{c.complaint_type}</td>
              <td>{c.description}</td>
              <td>{c.complaint_status}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Edit</button>{' '}
                <button onClick={() => handleDelete(c.complaint_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintsPage;