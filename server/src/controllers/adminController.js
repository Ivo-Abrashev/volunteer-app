// server/src/controllers/adminController.js
const supabase = require('../config/database');

// ПРОМЯНА НА РОЛЯ
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Валидация
    const allowedRoles = ['user', 'organizer', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Невалидна роля! Разрешени роли: user, organizer, admin',
      });
    }

    // Промени ролята
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Ролята е променена на ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Грешка при промяна на роля:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при промяна на роля',
      error: error.message,
    });
  }
};

// ИЗТРИВАНЕ НА ПОТРЕБИТЕЛ
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Провери дали потребителят съществува
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: 'Потребителят не е намерен',
      });
    }

    // Изтрий потребителя (CASCADE ще изтрие и свързаните данни)
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Потребител "${user.first_name} ${user.last_name}" е изтрит успешно`,
    });
  } catch (error) {
    console.error('Грешка при изтриване на потребител:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при изтриване на потребител',
      error: error.message,
    });
  }
};

// СТАТИСТИКИ
exports.getStatistics = async (req, res) => {
  try {
    // Users stats
    const { data: users } = await supabase.from('users').select('role');

    // Events stats
    const { data: events } = await supabase
      .from('events')
      .select('status, created_at');

    // Registrations stats
    const { data: registrations } = await supabase
      .from('registrations')
      .select('status, attended');

    const stats = {
      users: {
        total: users?.length || 0,
        byRole: {
          user: users?.filter((u) => u.role === 'user').length || 0,
          organizer: users?.filter((u) => u.role === 'organizer').length || 0,
          admin: users?.filter((u) => u.role === 'admin').length || 0,
        },
      },
      events: {
        total: events?.length || 0,
        byStatus: {
          draft: events?.filter((e) => e.status === 'draft').length || 0,
          published: events?.filter((e) => e.status === 'published').length || 0,
          cancelled: events?.filter((e) => e.status === 'cancelled').length || 0,
          completed: events?.filter((e) => e.status === 'completed').length || 0,
        },
      },
      registrations: {
        total: registrations?.length || 0,
        confirmed:
          registrations?.filter((r) => r.status === 'confirmed').length || 0,
        attended: registrations?.filter((r) => r.attended).length || 0,
      },
    };

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error('Грешка при зареждане на статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на статистики',
      error: error.message,
    });
  }
};

module.exports = exports;