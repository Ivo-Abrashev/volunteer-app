// server/src/controllers/registrationController.js
const supabase = require('../config/database');

// ЗАПИШИ СЕ ЗА СЪБИТИЕ
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // 1. Провери дали събитието съществува и е публикувано
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, status, max_participants, event_date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Събитието не е намерено'
      });
    }

    // 2. Провери дали събитието е публикувано
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Не можете да се запишете за това събитие (не е публикувано)'
      });
    }

    // 3. Провери дали събитието не е минало
    if (new Date(event.event_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Събитието вече е минало'
      });
    }

    // 4. Провери дали вече си записан
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingRegistration) {
      if (existingRegistration.status === 'cancelled') {
        // Ако е бил отписан, обнови статуса на 'confirmed'
        const { data: updatedReg, error: updateError } = await supabase
          .from('registrations')
          .update({ status: 'confirmed', registered_at: new Date().toISOString() })
          .eq('id', existingRegistration.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.json({
          success: true,
          message: 'Записахте се отново за събитието!',
          registration: updatedReg
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Вече сте записан за това събитие'
      });
    }

    // 5. Провери дали има свободни места
    if (event.max_participants) {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (count >= event.max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Няма свободни места за това събитие'
        });
      }
    }

    // 6. Създай регистрацията
    const { data: newRegistration, error } = await supabase
      .from('registrations')
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          status: 'confirmed'
        }
      ])
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          location
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: `Успешно се записахте за "${event.title}"!`,
      registration: newRegistration
    });

  } catch (error) {
    console.error('Грешка при записване за събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при записване за събитие',
      error: error.message
    });
  }
};

// ОТПИШИ СЕ ОТ СЪБИТИЕ
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // 1. Намери регистрацията
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        events (
          id,
          title,
          event_date
        )
      `)
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({
        success: false,
        message: 'Не сте записан за това събитие'
      });
    }

    // 2. Провери дали вече е отписан
    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Вече сте отписан от това събитие'
      });
    }

    // 3. Провери дали събитието не е започнало (опционално)
    const eventDate = new Date(registration.events.event_date);
    const now = new Date();
    const hoursDiff = (eventDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message: 'Не можете да се отпишете по-малко от 24 часа преди събитието'
      });
    }

    // 4. Обнови статуса на 'cancelled'
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', registration.id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Успешно се отписахте от "${registration.events.title}"`
    });

  } catch (error) {
    console.error('Грешка при отписване от събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при отписване от събитие',
      error: error.message
    });
  }
};

// ВЗЕМИ МОИТЕ РЕГИСТРАЦИИ (събитията за които съм записан)
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Филтър по статус (confirmed, cancelled)

    let query = supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        attended,
        events (
          id,
          title,
          description,
          location,
          event_date,
          duration,
          category,
          image_url,
          organizations (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });

    // Филтър по статус
    if (status) {
      query = query.eq('status', status);
    }

    const { data: registrations, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      count: registrations.length,
      registrations: registrations
    });

  } catch (error) {
    console.error('Грешка при зареждане на регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на регистрации',
      error: error.message
    });
  }
};

// ВЗЕМИ УЧАСТНИЦИТЕ НА СЪБИТИЕ (само за организатор/admin)
exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Провери дали събитието съществува
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, created_by')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Събитието не е намерено'
      });
    }

    // 2. Провери дали потребителят е собственик или admin
    if (event.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нямате права да виждате участниците на това събитие'
      });
    }

    // 3. Вземи участниците
    const { data: participants, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        attended,
        users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    // Раздели по статус
    const confirmed = participants.filter(p => p.status === 'confirmed');
    const cancelled = participants.filter(p => p.status === 'cancelled');

    res.json({
      success: true,
      event: {
        id: event.id,
        title: event.title
      },
      stats: {
        total: participants.length,
        confirmed: confirmed.length,
        cancelled: cancelled.length,
        attended: participants.filter(p => p.attended).length
      },
      participants: participants
    });

  } catch (error) {
    console.error('Грешка при зареждане на участници:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на участници',
      error: error.message
    });
  }
};

// МАРКИРАЙ ПРИСЪСТВИЕ (само за организатор/admin)
exports.markAttendance = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { attended } = req.body; // true или false

    // 1. Намери регистрацията
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select(`
        id,
        event_id,
        events (
          id,
          title,
          created_by
        )
      `)
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({
        success: false,
        message: 'Регистрацията не е намерена'
      });
    }

    // 2. Провери дали потребителят е собственик или admin
    if (registration.events.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нямате права да маркирате присъствие'
      });
    }

    // 3. Обнови присъствието
    const { error } = await supabase
      .from('registrations')
      .update({ attended: attended })
      .eq('id', registrationId);

    if (error) throw error;

    res.json({
      success: true,
      message: `Присъствието е маркирано като ${attended ? 'присъствал' : 'отсъствал'}`
    });

  } catch (error) {
    console.error('Грешка при маркиране на присъствие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при маркиране на присъствие',
      error: error.message
    });
  }
};