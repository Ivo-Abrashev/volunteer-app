// src/pages/EventDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatDateTime, getDaysUntil, getCategoryEmoji, getCategoryColor } from '../utils/helpers';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Провери дали user е записан за събитието
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch event details
  const fetchEvent = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await eventService.getEventById(id);
      setEvent(data.event);

      // Провери дали user е записан
      if (isAuthenticated() && data.event.registrations) {
        const userRegistration = data.event.registrations.find(
          (reg) => reg.user_id === user?.id && reg.status === 'confirmed'
        );
        setIsRegistered(!!userRegistration);
      }
    } catch (err) {
      setError('Събитието не е намерено');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Handle register
  const handleRegister = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setActionLoading(true);

    try {
      await eventService.registerForEvent(id);
      alert('Успешно се записахте за събитието! 🎉');
      fetchEvent(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Грешка при записване');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unregister
  const handleUnregister = async () => {
    if (!confirm('Сигурни ли сте, че искате да се отпишете?')) {
      return;
    }

    setActionLoading(true);

    try {
      await eventService.unregisterFromEvent(id);
      alert('Успешно се отписахте от събитието');
      fetchEvent(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Грешка при отписване');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Събитието не е намерено
          </h2>
          <p className="text-gray-600 mb-6">
            Събитието което търсите не съществува или е било изтрито
          </p>
          <Link to="/events">
            <Button variant="primary">Назад към събития</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Изчисли свободни места
  const confirmedRegistrations = event.registrations?.filter(
    (reg) => reg.status === 'confirmed'
  ).length || 0;
  const availableSpots = event.max_participants
    ? event.max_participants - confirmedRegistrations
    : null;
  const isFull = availableSpots !== null && availableSpots <= 0;

  // Провери дали е минало
  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/events"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад към събития
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Hero Image */}
              <div className="h-64 bg-gradient-to-r from-primary-400 to-secondary-400 relative">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-8xl">
                    {getCategoryEmoji(event.category)}
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category || 'Общо'}
                  </span>
                </div>

                {/* Days until badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-900 shadow-lg">
                    {getDaysUntil(event.event_date)}
                  </span>
                </div>
              </div>

              {/* Content */}
            <div className="p-8">
                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                {/* Organization */}
                {event.organizations && (
                  <div className="flex items-center mb-6 text-gray-700">
                    <span className="text-2xl mr-2">🏢</span>
                    <div>
                      <p className="font-semibold">{event.organizations.name}</p>
                      {event.organizations.website && (
                        <a
                          href={event.organizations.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {event.organizations.website}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="prose max-w-none mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    За събитието
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {/* Google Maps */}
                <div className="mt-6, mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Карта</h4>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                        <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2812.0111549403996!2d24.744647275919217!3d42.14194437121407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14acd1b0f4d72103%3A0x2dbfbf91b938256a!2z4oCe0KbQsNGAINCh0LjQvNC10L7QvdC-0LLQsCDQs9GA0LDQtNC40L3QsOKAnA!5e1!3m2!1sbg!2sbg!4v1765207156064!5m2!1sbg!2sbg"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location Map"
                        />
                    </div>
                </div>

                {/* Organizer Info */}
                {event.users && (
                  <Card className="bg-gray-50 p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Организатор:
                    </h3>
                    <p className="text-gray-700">
                      {event.users.first_name} {event.users.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{event.users.email}</p>
                  </Card>
                )}

                {/* Participants (ако user е organizer или admin) */}
                {(user?.role === 'organizer' || user?.role === 'admin') &&
                  event.created_by === user?.id && (
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Записани участници ({confirmedRegistrations})
                      </h2>
                      {event.registrations && event.registrations.length > 0 ? (
                        <div className="space-y-2">
                          {event.registrations
                            .filter((reg) => reg.status === 'confirmed')
                            .map((reg) => (
                              <Card key={reg.id} className="p-4 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-3">
                                  {reg.users.first_name[0]}
                                  {reg.users.last_name[0]}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {reg.users.first_name} {reg.users.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {reg.users.email}
                                  </p>
                                </div>
                                {reg.attended && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    ✓ Присъствал
                                  </span>
                                )}
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Все още няма записани участници</p>
                      )}
                    </div>
                  )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Event Info Card */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Информация
                </h3>

                <div className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <p className="text-sm text-gray-600">Дата и час</p>
                      <p className="font-semibold text-gray-900">
                        {formatDateTime(event.event_date)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📍</span>
                    <div>
                      <p className="text-sm text-gray-600">Локация</p>
                      <p className="font-semibold text-gray-900">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  {event.duration && (
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">⏱️</span>
                      <div>
                        <p className="text-sm text-gray-600">Продължителност</p>
                        <p className="font-semibold text-gray-900">
                          {event.duration} минути
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <p className="text-sm text-gray-600">Участници</p>
                      <p className="font-semibold text-gray-900">
                        {confirmedRegistrations}
                        {event.max_participants && ` / ${event.max_participants}`}
                      </p>
                      {availableSpots !== null && (
                        <p className="text-sm text-gray-600">
                          {availableSpots > 0
                            ? `Свободни места: ${availableSpots}`
                            : 'Няма свободни места'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              {event.status === 'published' && !isPast && (
                <Card className="p-6">
                  {isAuthenticated() ? (
                    <>
                      {isRegistered ? (
                        <Button
                          variant="danger"
                          size="lg"
                          fullWidth
                          onClick={handleUnregister}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Обработка...' : 'Отпиши се'}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={handleRegister}
                          disabled={actionLoading || isFull}
                        >
                          {actionLoading
                            ? 'Обработка...'
                            : isFull
                            ? 'Няма свободни места'
                            : 'Запиши се'}
                        </Button>
                      )}

                      {isRegistered && (
                        <p className="text-sm text-green-600 mt-3 text-center font-medium">
                          ✓ Вие сте записан за това събитие
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate('/login')}
                      >
                        Влезте за да се запишете
                      </Button>
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        Нужен е акаунт за записване
                      </p>
                    </>
                  )}
                </Card>
              )}

              {/* Past event notice */}
              {isPast && (
                <Card className="p-6 bg-gray-100">
                  <p className="text-center text-gray-700 font-medium">
                    Това събитие вече е минало
                  </p>
                </Card>
              )}

              {/* Share Card */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Сподели
                </h3>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                    Twitter
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;