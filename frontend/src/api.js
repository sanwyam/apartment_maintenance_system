const API_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Residents
  getResidents: () => request('/residents'),
  createResident: (data) => request('/residents', { method: 'POST', body: JSON.stringify(data) }),
  updateResident: (id, data) => request(`/residents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResident: (id) => request(`/residents/${id}`, { method: 'DELETE' }),

  // Apartments
  getApartments: () => request('/apartments'),
  createApartment: (data) => request('/apartments', { method: 'POST', body: JSON.stringify(data) }),
  updateApartment: (id, data) => request(`/apartments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApartment: (id) => request(`/apartments/${id}`, { method: 'DELETE' }),

  // Bills
  getBills: () => request('/bills'),
  createBill: (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) }),
  updateBill: (id, data) => request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBill: (id) => request(`/bills/${id}`, { method: 'DELETE' }),

  // Complaints
  getComplaints: () => request('/complaints'),
  createComplaint: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateComplaint: (id, data) => request(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteComplaint: (id) => request(`/complaints/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: () => request('/payments'),
  createPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id, data) => request(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),

  // Notices
  getNotices: () => request('/notices'),
  createNotice: (data) => request('/notices', { method: 'POST', body: JSON.stringify(data) }),
  updateNotice: (id, data) => request(`/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNotice: (id) => request(`/notices/${id}`, { method: 'DELETE' }),
};