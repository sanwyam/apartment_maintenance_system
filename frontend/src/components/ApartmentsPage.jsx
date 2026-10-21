import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { flat_number: '', floor_number: '', block_number: '' };

function ApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadApartments = () => {
    api.getApartments().then(setApartments).catch(() => setMessage('Could not load apartments'));
  };

  useEffect(() => {
    loadApartments();
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
    const payload = { ...form, floor_number: parseInt(form.floor_number, 10) };
    try {
      if (editingId) {
        await api.updateApartment(editingId, payload);
        setMessage('Apartment updated!');
      } else {
        await api.createApartment(payload);
        setMessage('Apartment added!');
      }
      resetForm();
      loadApartments();
    } catch {
      setMessage('Something went wrong, check the server terminal');
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.apartment_id);
    setForm({
      flat_number: a.flat_number,
      floor_number: String(a.floor_number),
      block_number: a.block_number,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteApartment(id);
      setMessage('Apartment deleted!');
      loadApartments();
    } catch {
      setMessage('Could not delete apartment');
    }
  };

  return (
    <div>
      <h2>{editingId ? 'Edit Apartment' : 'Add Apartment'}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="flat_number" placeholder="Flat (e.g. A101)" value={form.flat_number} onChange={handleChange} required />{' '}
        <input name="floor_number" type="number" placeholder="Floor" value={form.floor_number} onChange={handleChange} required />{' '}
        <input name="block_number" placeholder="Block (e.g. A)" value={form.block_number} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <p>{message}</p>}

      <h2>All Apartments ({apartments.length})</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Flat</th><th>Floor</th><th>Block</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apartments.map((a) => (
            <tr key={a.apartment_id}>
              <td>{a.apartment_id}</td>
              <td>{a.flat_number}</td>
              <td>{a.floor_number}</td>
              <td>{a.block_number}</td>
              <td>
                <button onClick={() => handleEdit(a)}>Edit</button>{' '}
                <button onClick={() => handleDelete(a.apartment_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApartmentsPage;