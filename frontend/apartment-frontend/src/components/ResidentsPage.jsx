import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { resident_name: '', resident_number: '', resident_email: '' };

function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadResidents = () => {
    api.getResidents().then(setResidents).catch(() => setMessage('Could not load residents'));
  };

  useEffect(() => {
    loadResidents();
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
    try {
      if (editingId) {
        await api.updateResident(editingId, form);
        setMessage('Resident updated!');
      } else {
        await api.createResident(form);
        setMessage('Resident added!');
      }
      resetForm();
      loadResidents();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.resident_id);
    setForm({
      resident_name: r.resident_name,
      resident_number: r.resident_number,
      resident_email: r.resident_email,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteResident(id);
      setMessage('Resident deleted!');
      loadResidents();
    } catch {
      setMessage('Could not delete resident');
    }
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Resident' : 'Add Resident'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="resident_name" placeholder="Name" value={form.resident_name} onChange={handleChange} required />{' '}
        <input name="resident_number" placeholder="Phone" value={form.resident_number} onChange={handleChange} required />{' '}
        <input name="resident_email" placeholder="Email" type="email" value={form.resident_email} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Residents ({residents.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((r) => (
            <tr key={r.resident_id}>
              <td>{r.resident_id}</td>
              <td>{r.resident_name}</td>
              <td>{r.resident_number}</td>
              <td>{r.resident_email}</td>
              <td>
                <button onClick={() => handleEdit(r)}>Edit</button>{' '}
                <button onClick={() => handleDelete(r.resident_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResidentsPage;