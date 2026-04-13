const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { authenticateToken } = require('./auth');
const authRoutes = require('./routes/authRoutes');
const { createCrudRouter } = require('./routes/crudRoutes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Auth routes (public)
app.use('/auth', authRoutes);

// Protected CRUD routes
app.use('/api/organizations', authenticateToken, createCrudRouter('organizations', ['name', 'industry', 'website']));
app.use('/api/contacts', authenticateToken, createCrudRouter('contacts', ['first_name', 'last_name', 'email', 'phone', 'organization_id']));
app.use('/api/deals', authenticateToken, createCrudRouter('deals', ['title', 'value', 'stage', 'contact_id', 'organization_id']));

app.listen(PORT, () => {
  console.log(`Mini CRM backend running on http://localhost:${PORT}`);
});
