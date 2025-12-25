// server/src/controllers/eventController.js
const supabase = require('../config/database');

// ВЗЕМИ ВСИЧКИ СЪБИТИЯ (с филтри)
exports.getAllEvents = async (req, res) => {
  try {
    const { status, category, search, limit = 50, offset = 0 } = req.query;

    // Започни заявката
    let query = supabase
      .from('events')
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url
        ),
        users!events_created_by_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('event_date', { ascending: true });

    // Филтър по статус
    if (status) {
      query = query.eq('status', status);
    }

    // Филтър по категория
    if (category) {
      query = query.eq('category', category);
    }

    // Търсене по заглавие или описание
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination (страниране)
    query = query.range(offset, offset + limit - 1);

    const { data: events, error } = await query;

    if (error) throw error;

    // Добави броя на участниците за всяко събитие
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'confirmed');

        return {
          ...event,
          participantsCount: count || 0,
        };
      })
    );

    res.json({
      success: true,
      count: eventsWithParticipants.length,
      events: eventsWithParticipants,
        });

  } catch (error) {
    
    console.error('Грешка при зареждане на събития:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на събития',
      error: error.message
    });
  }
};

// ВЗЕМИ ЕДНО СЪБИТИЕ ПО ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizations (
          id,
          name,
          description,
          logo_url,
          website
        ),
        users!events_created_by_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        registrations (
          id,
          user_id,
          status,
          registered_at,
          users (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Събитието не е намерено'
      });
    }

    res.json({
      success: true,
      event: event
    });

  } catch (error) {
    console.error('Грешка при зареждане на събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на събитие',
      error: error.message
    });
  }
};

// СЪЗДАЙ НОВО СЪБИТИЕ (само organizer и admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      organizationId,
      location,
      eventDate,
      duration,
      maxParticipants,
      category,
      imageUrl,
      status = 'draft'
    } = req.body;

    // Валидация
    if (!title || !description || !location || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Моля попълнете всички задължителни полета (заглавие, описание, локация, дата)'
      });
    }

    // Провери дали организацията принадлежи на текущия потребител
    if (organizationId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('organizer_id')
        .eq('id', organizationId)
        .single();

      if (org && org.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Нямате права да създавате събития за тази организация'
        });
      }
    }

    // Създай събитието
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          organization_id: organizationId || null,
          created_by: req.user.id,
          location,
          event_date: eventDate,
          duration,
          max_participants: maxParticipants,
          category,
          image_url: imageUrl,
          status
        }
      ])
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Събитието е създадено успешно!',
      event: newEvent
    });

  } catch (error) {
    console.error('Грешка при създаване на събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при създаване на събитие',
      error: error.message
    });
  }
};

// РЕДАКТИРАЙ СЪБИТИЕ (само собственик или admin)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      eventDate,
      duration,
      maxParticipants,
      category,
      imageUrl,
      status
    } = req.body;

    // Провери дали събитието съществува
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Събитието не е намерено'
      });
    }

    // Провери дали потребителят е собственик или admin
    if (existingEvent.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нямате права да редактирате това събитие'
      });
    }

    // Обнови събитието
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (eventDate) updateData.event_date = eventDate;
    if (duration !== undefined) updateData.duration = duration;
    if (maxParticipants !== undefined) updateData.max_participants = maxParticipants;
    if (category) updateData.category = category;
    if (imageUrl) updateData.image_url = imageUrl;
    if (status) updateData.status = status;
    
    updateData.updated_at = new Date().toISOString();

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url
        )
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Събитието е обновено успешно!',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Грешка при обновяване на събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при обновяване на събитие',
      error: error.message
    });
  }
};

// ИЗТРИЙ СЪБИТИЕ (само собственик или admin)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Провери дали събитието съществува
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('created_by, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Събитието не е намерено'
      });
    }

    // Провери дали потребителят е собственик или admin
    if (existingEvent.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нямате права да изтриете това събитие'
      });
    }

    // Изтрий събитието
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Събитието "${existingEvent.title}" е изтрито успешно!`
    });

  } catch (error) {
    console.error('Грешка при изтриване на събитие:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при изтриване на събитие',
      error: error.message
    });
  }
};

// ВЗЕМИ МОИТЕ СЪБИТИЯ (създадени от мен)
exports.getMyEvents = async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url
        ),
        registrations (
          id,
          status
        )
      `)
      .eq('created_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Добави броя на записани потребители
    const eventsWithStats = events.map(event => ({
      ...event,
      participantsCount: event.registrations.length,
      registrations: undefined // Махни registrations от отговора
    }));

    res.json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats
    });

  } catch (error) {
    console.error('Грешка при зареждане на моите събития:', error);
    res.status(500).json({
      success: false,
      message: 'Грешка при зареждане на моите събития',
      error: error.message
    });
  }
};

