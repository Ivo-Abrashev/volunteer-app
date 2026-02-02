// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./config/database');
const { protect, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes'); 
const registrationRoutes = require('./routes/registrationRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const publicRoutes = require('./routes/publicRoutes'); // НОВО!

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
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/users', userRoutes);
app.use('/api/public', publicRoutes); // НОВО!
app.use('/api', registrationRoutes); // Registration routes

// Admin-only route — извличане на потребители (пагинирано)
// Публичният debug route беше премахнат; достъпът е ограничен до администратори
app.get('/api/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100); // Max 100
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      page,
      limit,
      total: count ?? data.length,
      count: data.length,
      users: data
    });
  } catch (error) {
    console.error('Грешка при зареждане на потребители:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на потребители',
      ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {})
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сървърът работи на http://localhost:${PORT}`);
});
