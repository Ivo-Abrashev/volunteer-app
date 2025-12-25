// server/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const supabase = require('../config/database');

// ВЗЕМИ ПРОФИЛ
exports.getProfile = async (req, res) => {
  try {
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
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Грешка при зареждане на профил:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на профил',
      error: error.message,
    });
  }
};

// ОБНОВИ ПРОФИЛ
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    // Валидация
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Име и фамилия са задължителни',
      });
    }

    // Обнови профила
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, role, phone, date_of_birth')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Профилът е обновен успешно',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.date_of_birth,
      },
    });
  } catch (error) {
    console.error('Грешка при обновяване на профил:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при обновяване на профил',
      error: error.message,
    });
  }
};

// ПРОМЯНА НА ПАРОЛА
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Валидация
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Текуща и нова парола са задължителни',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Новата парола трябва да е поне 6 символа',
      });
    }

    // Вземи текущата парола от базата
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (fetchError) throw fetchError;

    // Провери текущата парола
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Текущата парола е грешна',
      });
    }

    // Хеширай новата парола
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обнови паролата
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Паролата е променена успешно',
    });
  } catch (error) {
    console.error('Грешка при промяна на парола:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при промяна на парола',
      error: error.message,
    });
  }
};

// ИЗТРИВАНЕ НА ПРОФИЛ
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Изтрий потребителя (CASCADE ще изтрие и свързаните данни)
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Профилът е изтрит успешно',
    });
  } catch (error) {
    console.error('Грешка при изтриване на профил:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при изтриване на профил',
      error: error.message,
    });
  }
};

module.exports = exports;