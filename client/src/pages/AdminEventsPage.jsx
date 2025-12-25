// src/pages/AdminEventsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getCategoryColor } from '../utils/helpers';

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft, cancelled, completed

  // Fetch all events
  const fetchEvents = async () => {
    setLoading(true);

    try {
      // Fetch all events (без статус филтър)
      const data = await eventService.getAllEvents({});
      setEvents(data.events);
    } catch (err) {
      console.error('Грешка при зареждане на събития:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Delete event
  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (
      !confirm(
        `Сигурни ли сте, че искате да изтриете "${eventTitle}"?\n\nТова действие е необратимо!`
      )
    ) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      alert('Събитието е изтрито успешно!');
      fetchEvents(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Грешка при изтриване на събитие');
    }
  };

  // Change status
  const handleChangeStatus = async (eventId, currentStatus) => {
    const statuses = ['draft', 'published', 'cancelled', 'completed'];
    const newStatus = prompt(
      `Промяна на статус за събитие ${eventId}\n\nВъведете нов статус: draft, published, cancelled или completed`,
      currentStatus
    );

    if (!newStatus || !statuses.includes(newStatus.toLowerCase())) {
      alert('Невалиден статус!');
      return;
    }

    if (newStatus.toLowerCase() === currentStatus) {
      return; // Няма промяна
    }

    try {
      await eventService.updateEvent(eventId, { status: newStatus.toLowerCase() });
      alert('Статусът е променен успешно! ✅');
      fetchEvents(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Грешка при промяна на статус');
    }
  };

  // Filter events
  const filteredEvents =
    filter === 'all' ? events : events.filter((e) => e.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/admin"
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
          Назад към Admin Panel
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Управление на събития
          </h1>
          <p className="text-gray-600">Общо {events.length} събития в системата</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Всички</p>
              <p className="text-3xl font-bold text-gray-900">{events.length}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Публикувани</p>
              <p className="text-3xl font-bold text-green-600">
                {events.filter((e) => e.status === 'published').length}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Чернови</p>
              <p className="text-3xl font-bold text-yellow-600">
                {events.filter((e) => e.status === 'draft').length}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Отменени</p>
              <p className="text-3xl font-bold text-red-600">
                {events.filter((e) => e.status === 'cancelled').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Всички ({events.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✓ Публикувани ({events.filter((e) => e.status === 'published').length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Чернови ({events.filter((e) => e.status === 'draft').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✗ Отменени ({events.filter((e) => e.status === 'cancelled').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✓ Завършени ({events.filter((e) => e.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Events Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Събитие
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Организатор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Участници
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {event.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          📍 {event.location}
                        </div>
                        {event.category && (
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            {event.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.users?.first_name} {event.users?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.event_date).toLocaleDateString('bg-BG')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleTimeString('bg-BG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[event.status]
                        }`}
                      >
                        {event.status === 'draft' && 'Чернова'}
                        {event.status === 'published' && 'Публикувано'}
                        {event.status === 'cancelled' && 'Отменено'}
                        {event.status === 'completed' && 'Завършено'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.participantsCount || 0}
                      {event.max_participants && ` / ${event.max_participants}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            👁️
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStatus(event.id, event.status)}
                        >
                          🔄
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              Няма събития с този филтър
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminEventsPage;