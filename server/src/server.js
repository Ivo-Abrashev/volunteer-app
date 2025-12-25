// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes'); 
const registrationRoutes = require('./routes/registrationRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes'); // НОВО!

// Основен route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Volunteer Platform API 🚀',
    status: 'Running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);  // Authentication routes
app.use('/api/events', eventRoutes); // Event routes
app.use('/api', registrationRoutes); // Registration routes
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/users', userRoutes); // НОВО!

// Тестов route - вземи всички потребители (за debug)
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, role, created_at');
    
    if (error) throw error;
    
    res.json({
      success: true,
      count: data.length,
      users: data
    });
  } catch (error) {
    console.error('Грешка при зареждане на потребители:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сървърът работи на http://localhost:${PORT}`);
});