// server/src/controllers/publicController.js
const supabase = require('../config/database');

const extractCity = (location) => {
  if (!location || typeof location !== 'string') {
    return '';
  }

  const [city] = location.split(',');
  return city ? city.trim() : '';
};

exports.getPublicStatistics = async (req, res) => {
  try {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('status, location, duration');

    if (eventsError) throw eventsError;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role');

    if (usersError) throw usersError;

    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('status, events ( duration )')
      .eq('status', 'confirmed');

    if (registrationsError) throw registrationsError;

    const publishedEvents = (events || []).filter((event) => event.status === 'published');
    const activeEvents = publishedEvents.length;
    const volunteers = (users || []).filter((user) => user.role === 'user').length;

    const citySet = new Set(
      publishedEvents
        .map((event) => extractCity(event.location))
        .filter((city) => city)
    );

    const totalMinutes = (registrations || []).reduce((sum, registration) => {
      const duration = Number(registration?.events?.duration || 0);
      return sum + (Number.isFinite(duration) ? duration : 0);
    }, 0);

    const hoursHelped = Math.round(totalMinutes / 60);

    res.json({
      success: true,
      statistics: {
        activeEvents,
        volunteers,
        cities: citySet.size,
        hoursHelped,
      },
    });
  } catch (error) {
    console.error('Failed to load public statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load public statistics',
      error: error.message,
    });
  }
};
