import { useEffect, useState } from 'react';
import { api } from '../api';

function Receipt({ paymentId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId) return;
    setData(null);
    setError('');
    api
      .getReceipt(paymentId)
      .then(setData)
      .catch(() => setError('Could not load receipt. Only completed payments have receipts.'));
  }, [paymentId]);

  if (!paymentId) return null;

  if (error) {
    return (
      <div className="card receipt">
        <p>{error}</p>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    );
  }

  if (!data) return <p>Loading receipt...</p>;

  const receiptNo = `RCPT-${String(data.payment_id).padStart(6, '0')}`;
  const date = (d) => String(d).slice(0, 10);

  return (
    <div className="card receipt">
      <div className="receipt-actions no-print">
        <button type="button" onClick={() => window.print()}>Print / Save PDF</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div className="receipt-head">
        <div>
          <div className="card-title">Payment receipt</div>
          <div className="receipt-no">{receiptNo}</div>
        </div>
        <span className="pill" style={{ color: '#3A0F34', background: 'rgba(234, 170, 0, 0.25)' }}>
          Paid
        </span>
      </div>

      <div className="receipt-row"><span>Resident</span><span>{data.resident_name}</span></div>
      <div className="receipt-row"><span>Email</span><span>{data.resident_email}</span></div>
      <div className="receipt-row"><span>Phone</span><span>{data.resident_number}</span></div>
      <div className="receipt-row">
        <span>Apartment</span>
        <span>{data.flat_number}, Block {data.block_number}, Floor {data.floor_number}</span>
      </div>
      <div className="receipt-row"><span>Bill period</span><span>{data.bill_month}</span></div>
      <div className="receipt-row"><span>Bill due date</span><span>{date(data.due_date)}</span></div>
      <div className="receipt-row"><span>Payment date</span><span>{date(data.payment_date)}</span></div>
      <div className="receipt-row"><span>Payment mode</span><span>{data.payment_mode}</span></div>

      <div className="receipt-total">
        <span>Amount paid</span>
        <strong>₹{Number(data.bill_amount).toFixed(2)}</strong>
      </div>
    </div>
  );
}

export default Receipt;