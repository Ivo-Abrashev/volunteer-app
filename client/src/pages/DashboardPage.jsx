// src/pages/DashboardPage.jsx
// Organizer Dashboard Page
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDateTime, getDaysUntil, getCategoryColor } from '../utils/helpers';
import { showSuccess, showError, showPromise } from '../utils/toast';

const DashboardPage = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch моите създадени събития
  const fetchMyEvents = async () => {
  setLoading(true);
  setError('');

  try {
    const data = await eventService.getMyEvents();
    setMyEvents(data.events); // КОРИГИРАНО!
  } catch (err) {
    setError('Грешка при зареждане на събития');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Handle delete
  const handleDelete = async (eventId, eventTitle) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${eventTitle}"?`)) {
      return;
    }

    const promise = eventService.deleteEvent(eventId);

    showPromise(promise, {
      loading: 'Изтриване...',
      success: 'Събитието е изтрито успешно!',
      error: (err) => err.response?.data?.message || 'Грешка при изтриване',
    });

    try {
      await promise;
      fetchMyEvents();
    } catch {
      // Error handled by toast.promise
    }
  };

  // Handle publish
  const handlePublish = async (eventId, eventTitle) => {
    if (
      !confirm(
        `Искате ли да публикувате "${eventTitle}"?\n\nСъбитието ще стане видимо за всички потребители.`
      )
    ) {
      return;
    }

    try {
      await eventService.updateEvent(eventId, { status: 'published' });
      showSuccess('Събитието е публикувано успешно! 🎉');
      fetchMyEvents(); // Refresh
    } catch (err) {
      showError(err.response?.data?.message || 'Грешка при публикуване');
    }
  };

  // Статистики
  const totalEvents = myEvents.length;
  const publishedEvents = myEvents.filter((e) => e.status === 'published').length;
  const draftEvents = myEvents.filter((e) => e.status === 'draft').length;
  const totalParticipants = myEvents.reduce(
    (sum, event) => sum + (event.participantsCount || 0),
    0
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
            Организаторски панел
          </h1>
          <p className="text-gray-600">
            Добре дошли, {user?.firstName}! Управлявайте вашите събития тук.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Общо събития</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Публикувани</p>
                <p className="text-2xl font-bold text-gray-900">{publishedEvents}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Чернови</p>
                <p className="text-2xl font-bold text-gray-900">{draftEvents}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Участници</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalParticipants}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Event Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard/create-event')}
          >
            ➕ Създай ново събитие
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Events List */}
        {myEvents.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Моите събития ({totalEvents})
            </h2>

            {myEvents.map((event) => {
              const isPast = new Date(event.event_date) < new Date();

              const imageUrl = event.image_url || event.imageUrl;
              const statusColors = {
                draft: 'bg-yellow-100 text-yellow-800',
                published: 'bg-green-100 text-green-800',
                cancelled: 'bg-red-100 text-red-800',
                completed: 'bg-blue-100 text-blue-800',
              };

              return (
                <Card key={event.id} className="overflow-hidden">
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-48 h-32 md:h-auto bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white text-4xl">
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
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                statusColors[event.status]
                              }`}
                            >
                              {event.status === 'draft' && 'Чернова'}
                              {event.status === 'published' && 'Публикувано'}
                              {event.status === 'cancelled' && 'Отменено'}
                              {event.status === 'completed' && 'Завършено'}
                            </span>
                            {event.category && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                                  event.category
                                )}`}
                              >
                                {event.category}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                            {event.description}
                          </p>

                          {/* Info Grid */}
                          <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-1">📅</span>
                              <span>{formatDateTime(event.event_date)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1">📍</span>
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1">👥</span>
                              <span>
                                {event.participantsCount || 0}
                                {event.max_participants && ` / ${event.max_participants}`}{' '}
                                участници
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Days until badge */}
                        {!isPast && event.status === 'published' && (
                          <div className="ml-4">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-800">
                              {getDaysUntil(event.event_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            👁️ Преглед
                          </Button>
                        </Link>

                        <Link to={`/dashboard/events/${event.id}/edit`}>
                          <Button variant="primary" size="sm">
                            ✏️ Редактирай
                          </Button>
                        </Link>

                        <Link to={`/dashboard/events/${event.id}/participants`}>
                          <Button variant="outline" size="sm">
                            👥 Участници ({event.participantsCount || 0})
                          </Button>
                        </Link>

                        {event.status === 'draft' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePublish(event.id, event.title)}
                        >
                          ✓ Публикувай
                        </Button>
                      )}

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(event.id, event.title)}
                        >
                          🗑️ Изтрий
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Все още нямате събития
            </h3>
            <p className="text-gray-600 mb-6">
              Създайте вашето първо доброволческо събитие и започнете да правите
              разликата!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard/create-event')}
            >
              Създай събитие
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;


