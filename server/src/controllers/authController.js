// server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

// Функция за генериране на JWT токен
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },  // Данни в токена
    process.env.JWT_SECRET,        // Секретен ключ
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Валидност
  );
};

// РЕГИСТРАЦИЯ
exports.register = async (req, res) => {
  console.log('REGISTER REQ BODY:', req.body); // 👈 добави това
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    // 1. Валидация на данните
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Моля попълнете всички задължителни полета!'
      });
    }

    // 2. Провери дали email вече съществува
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Потребител с този email вече съществува!'
      });
    }

    // 3. Хеширай паролата
    const salt = await bcrypt.genSalt(10);  // "сол" за хеширане
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Създай потребителя в базата
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          date_of_birth: dateOfBirth || null,
          role: 'user'  // По подразбиране всеки е user
        }
      ])
      .select('id, email, first_name, last_name, role, created_at')
      .single();
      console.log('NEW USER:', newUser);

    if (error) throw error;
    

    // 5. Генерирай JWT токен
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // 6. Върни отговор
    res.status(201).json({
      success: true,
      message: 'Регистрацията е успешна!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Грешка при регистрация:', error);
    res.status(500).json({
      success: false,
      message: 'Възникна грешка при регистрацията',
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Валидация
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Моля въведете email и парола!'
      });
    }

    // 2. Намери потребителя по email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Невалиден email или парола!'
      });
    }

    // 3. Провери паролата
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Невалиден email или парола!'
      });
    }

    // 4. Генерирай токен
    const token = generateToken(user.id, user.email, user.role);

    // 5. Върни отговор
    res.json({
      success: true,
      message: 'Успешен вход!',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Грешка при login:', error);
    res.status(500).json({
      success: false,
      message: 'Възникна грешка при влизането',
      error: error.message
    });
  }
};

// GET CURRENT USER (за проверка на токен)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user идва от auth middleware (ще го създадем след малко)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, date_of_birth, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Грешка при зареждане на потребител:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на потребител',
      error: error.message
    });
  }
};