require('dotenv').config();
const express = require('express');
const { Pool, types } = require('pg');
const cors = require('cors');

// Send DATE columns as plain "YYYY-MM-DD" text (avoids timezone day-shifts)
types.setTypeParser(1082, (val) => val);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Test database connection
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✅ Database connected successfully');
    }
});

// ========== RESIDENT ROUTES ==========

app.get('/api/residents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resident ORDER BY resident_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/residents/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resident WHERE resident_id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/residents', async (req, res) => {
    try {
        const { resident_name, resident_number, resident_email } = req.body;
        const result = await pool.query(
            'INSERT INTO resident (resident_name, resident_number, resident_email) VALUES ($1, $2, $3) RETURNING *',
            [resident_name, resident_number, resident_email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/residents/:id', async (req, res) => {
    try {
        const { resident_name, resident_number, resident_email } = req.body;
        const result = await pool.query(
            'UPDATE resident SET resident_name = $1, resident_number = $2, resident_email = $3 WHERE resident_id = $4 RETURNING *',
            [resident_name, resident_number, resident_email, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/residents/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM resident WHERE resident_id = $1', [req.params.id]);
        res.json({ message: 'Resident deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== APARTMENT ROUTES ==========

app.get('/api/apartments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM apartment ORDER BY apartment_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/apartments/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM apartment WHERE apartment_id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/apartments', async (req, res) => {
    try {
        const { flat_number, floor_number, block_number } = req.body;
        const result = await pool.query(
            'INSERT INTO apartment (flat_number, floor_number, block_number) VALUES ($1, $2, $3) RETURNING *',
            [flat_number, floor_number, block_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/apartments/:id', async (req, res) => {
    try {
        const { flat_number, floor_number, block_number } = req.body;
        const result = await pool.query(
            'UPDATE apartment SET flat_number = $1, floor_number = $2, block_number = $3 WHERE apartment_id = $4 RETURNING *',
            [flat_number, floor_number, block_number, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/apartments/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM apartment WHERE apartment_id = $1', [req.params.id]);
        res.json({ message: 'Apartment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== MAINTENANCE BILL ROUTES ==========

app.get('/api/bills', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM maintenance_bill ORDER BY bill_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/apartment/:apartment_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM maintenance_bill WHERE apartment_id = $1', [req.params.apartment_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bills', async (req, res) => {
    try {
        const { apartment_id, bill_month, due_date, bill_amount } = req.body;
        const result = await pool.query(
            'INSERT INTO maintenance_bill (apartment_id, bill_month, due_date, bill_amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [apartment_id, bill_month, due_date, bill_amount]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/bills/:id', async (req, res) => {
    try {
        const { apartment_id, bill_month, due_date, bill_amount } = req.body;
        const result = await pool.query(
            'UPDATE maintenance_bill SET apartment_id = $1, bill_month = $2, due_date = $3, bill_amount = $4 WHERE bill_id = $5 RETURNING *',
            [apartment_id, bill_month, due_date, bill_amount, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/bills/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM maintenance_bill WHERE bill_id = $1', [req.params.id]);
        res.json({ message: 'Bill deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== COMPLAINT ROUTES ==========

app.get('/api/complaints', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM complaint ORDER BY complaint_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/complaints/resident/:resident_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM complaint WHERE resident_id = $1', [req.params.resident_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complaints', async (req, res) => {
    try {
        const { resident_id, complaint_type, description, complaint_status } = req.body;
        const result = await pool.query(
            'INSERT INTO complaint (resident_id, complaint_type, description, complaint_status) VALUES ($1, $2, $3, $4) RETURNING *',
            [resident_id, complaint_type, description, complaint_status || 'Open']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/complaints/:id', async (req, res) => {
    try {
        const { resident_id, complaint_type, description, complaint_status } = req.body;
        const result = await pool.query(
            'UPDATE complaint SET resident_id = $1, complaint_type = $2, description = $3, complaint_status = $4 WHERE complaint_id = $5 RETURNING *',
            [resident_id, complaint_type, description, complaint_status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/complaints/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM complaint WHERE complaint_id = $1', [req.params.id]);
        res.json({ message: 'Complaint deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== PAYMENT ROUTES ==========

app.get('/api/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payment ORDER BY payment_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/payments/resident/:resident_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payment WHERE resident_id = $1', [req.params.resident_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { resident_id, bill_id, payment_date, payment_mode, payment_status } = req.body;
        const result = await pool.query(
            'INSERT INTO payment (resident_id, bill_id, payment_date, payment_mode, payment_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [resident_id, bill_id, payment_date, payment_mode, payment_status || 'Pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/payments/:id', async (req, res) => {
    try {
        const { resident_id, bill_id, payment_date, payment_mode, payment_status } = req.body;
        const result = await pool.query(
            'UPDATE payment SET resident_id = $1, bill_id = $2, payment_date = $3, payment_mode = $4, payment_status = $5 WHERE payment_id = $6 RETURNING *',
            [resident_id, bill_id, payment_date, payment_mode, payment_status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/payments/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM payment WHERE payment_id = $1', [req.params.id]);
        res.json({ message: 'Payment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== NOTICE ROUTES ==========

app.get('/api/notices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notice ORDER BY notice_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notices/resident/:resident_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notice WHERE resident_id = $1', [req.params.resident_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notices', async (req, res) => {
    try {
        const { resident_id, notice_title, notice_data, notice_date } = req.body;
        const result = await pool.query(
            'INSERT INTO notice (resident_id, notice_title, notice_data, notice_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [resident_id, notice_title, notice_data, notice_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notices/:id', async (req, res) => {
    try {
        const { resident_id, notice_title, notice_data, notice_date } = req.body;
        const result = await pool.query(
            'UPDATE notice SET resident_id = $1, notice_title = $2, notice_data = $3, notice_date = $4 WHERE notice_id = $5 RETURNING *',
            [resident_id, notice_title, notice_data, notice_date, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM notice WHERE notice_id = $1', [req.params.id]);
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ========== RECEIPT ROUTE ==========

app.get('/api/payments/:id/receipt', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.payment_id, p.payment_date, p.payment_mode, p.payment_status,
                    r.resident_name, r.resident_email, r.resident_number,
                    a.flat_number, a.block_number, a.floor_number,
                    b.bill_month, b.due_date, b.bill_amount
             FROM payment p
             JOIN resident r ON r.resident_id = p.resident_id
             JOIN maintenance_bill b ON b.bill_id = p.bill_id
             JOIN apartment a ON a.apartment_id = b.apartment_id
             WHERE p.payment_id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (result.rows[0].payment_status !== 'Completed') {
            return res.status(400).json({ error: 'Receipts are only available for completed payments' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});