// src/pages/MyEventsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import EventCard from '../components/events/EventCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatDateTime, getDaysUntil } from '../utils/helpers';
import { showSuccess, showError } from '../utils/toast';

const MyEventsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  // Fetch моите регистрации
  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await eventService.getMyRegistrations();
      setRegistrations(data.registrations);
    } catch (err) {
      setError('Грешка при зареждане на събития');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle unregister
  const handleUnregister = async (eventId) => {
    if (!confirm('Сигурни ли сте, че искате да се отпишете?')) {
      return;
    }

    try {
      await eventService.unregisterFromEvent(eventId);
      showSuccess('Успешно се отписахте от събитието');
      fetchRegistrations(); // Refresh
    } catch (err) {
      showError(err.response?.data?.message || 'Грешка при отписване');
    }
  };

  // Филтриране на събития
  const filterRegistrations = () => {
    const now = new Date();

    return registrations.filter((reg) => {
      // Само confirmed регистрации
      if (reg.status !== 'confirmed') return false;

      const eventDate = new Date(reg.events.event_date);

      if (filter === 'upcoming') {
        return eventDate >= now;
      } else if (filter === 'past') {
        return eventDate < now;
      }
      return true; // all
    });
  };

  const filteredRegistrations = filterRegistrations();

  // Раздели на upcoming и past
  const upcomingEvents = registrations.filter(
    (reg) =>
      reg.status === 'confirmed' &&
      new Date(reg.events.event_date) >= new Date()
  );
  const pastEvents = registrations.filter(
    (reg) =>
      reg.status === 'confirmed' &&
      new Date(reg.events.event_date) < new Date()
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Моите участия
          </h1>
          <p className="text-gray-600">
            Преглеждайте събитията, за които сте записан
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Общо регистрации</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter((r) => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Предстоящи</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingEvents.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Завършени</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pastEvents.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Всички ({registrations.filter((r) => r.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Предстоящи ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Минали ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events List */}
        {filteredRegistrations.length > 0 ? (
          <div className="space-y-6">
            {filteredRegistrations.map((registration) => {
              const event = registration.events;

              const imageUrl = event.image_url || event.imageUrl;
              const isPast = new Date(event.event_date) < new Date();

              return (
                <Card key={registration.id} className="overflow-hidden">
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white text-6xl">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {event.category === 'екология' && '🌍'}
                          {event.category === 'образование' && '📚'}
                          {event.category === 'социални' && '🤲'}
                          {event.category === 'култура' && '🎨'}
                          {!event.category && '📅'}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          {event.organizations && (
                            <p className="text-gray-600 flex items-center">
                              <span className="mr-1">🏢</span>
                              {event.organizations.name}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        {isPast ? (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            Завършено
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {getDaysUntil(event.event_date)}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Info */}
                      <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📅</span>
                          <span>{formatDateTime(event.event_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📍</span>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        {event.duration && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">⏱️</span>
                            <span>{event.duration} минути</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">✓</span>
                          <span>
                            Записан на{' '}
                            {new Date(registration.registered_at).toLocaleDateString(
                              'bg-BG'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Attendance Badge */}
                      {isPast && registration.attended && (
                        <div className="mb-4">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            ✓ Присъствали сте
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Виж детайли
                          </Button>
                        </Link>

                        {!isPast && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUnregister(event.id)}
                          >
                            Отпиши се
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'upcoming' && '📅'}
              {filter === 'past' && '✓'}
              {filter === 'all' && '🔍'}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'upcoming' && 'Нямате предстоящи събития'}
              {filter === 'past' && 'Нямате минали събития'}
              {filter === 'all' && 'Не сте записан за нито едно събитие'}
            </h3>
            <p className="text-gray-600 mb-6">
              Разгледайте нашите доброволчески инициативи и се запишете за събитие
            </p>
            <Link to="/events">
              <Button variant="primary">Разгледай събития</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
