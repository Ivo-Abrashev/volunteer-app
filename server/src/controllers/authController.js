// server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

// За изпращане на имейли
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');

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
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, role } = req.body;

    // 1. Валидация
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Моля попълнете всички задължителни полета!',
      });
    }

    // 2. Проверка дали email съществува
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Потребител с този email вече съществува!',
      });
    }

    // 3. Хеширане на паролата
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Валидирай роля
    const allowedRoles = ['user', 'organizer'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // 5. Генерирай verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // 6. Създай потребителя (НЕ е верифициран!)
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
          role: userRole,

          // 🔐 email verification
          is_email_verified: false,
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpires,
        },
      ])
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) throw error;

    // 7. Изпрати verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(newUser.email, verifyUrl);

    // ❗ НЕ връщаме JWT при регистрация
    res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      message: 'Регистрацията е успешна! Моля, потвърдете имейла си.',
    });
  } catch (error) {
    console.error('Грешка при регистрация:', error);
    res.status(500).json({
      success: false,
      message: 'Възникна грешка при регистрацията',
      error: error.message,
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

    // Проверка дали имейлът е потвърден
    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Имейлът не е потвърден. Провери пощата си.',
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

// VERIFY EMAIL (клик от имейла)
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Липсва token.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, is_email_verified, email_verification_expires')
      .eq('email_verification_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Невалиден или използван линк.' });
    }

    if (!user.email_verification_expires || new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Линкът е изтекъл. Изпрати нов.' });
    }

    const { error: updErr } = await supabase
      .from('users')
      .update({
        is_email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
      })
      .eq('id', user.id);

    if (updErr) throw updErr;

    return res.json({ success: true, message: 'Имейлът е потвърден успешно!' });
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).json({ success: false, message: 'Грешка при потвърждение.' });
  }
};

// RESEND VERIFICATION EMAIL (бутон "Изпрати пак")
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Липсва email.' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email, is_email_verified')
      .eq('email', email)
      .maybeSingle();

    // Не издаваме дали съществува имейла
    if (!user) {
      return res.json({ success: true, message: 'Ако имейлът съществува, изпратихме нов линк.' });
    }

    if (user.is_email_verified) {
      return res.json({ success: true, message: 'Имейлът вече е потвърден.' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updErr } = await supabase
      .from('users')
      .update({
        email_verification_token: token,
        email_verification_expires: expires,
      })
      .eq('id', user.id);

    if (updErr) throw updErr;

    const { sendVerificationEmail } = require('../utils/mailer');
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl);

    return res.json({ success: true, message: 'Изпратихме нов линк за потвърждение.' });
  } catch (err) {
    console.error('resendVerification error:', err);
    return res.status(500).json({ success: false, message: 'Грешка при изпращане.' });
  }
};
