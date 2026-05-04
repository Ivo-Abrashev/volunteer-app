// src/pages/AdminEventsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { showError, showPromise } from '../utils/toast';
import { getApiErrorMessage } from '../utils/apiError';

import StatusChangeModal from '../components/common/StatusChangeModal';
import eventService from '../services/eventService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate, formatTime, getCategoryColor } from '../utils/helpers';

const STATUS_OPTIONS = ['draft', 'published', 'cancelled', 'completed'];

const STATUS_LABELS = {
  draft: 'Чернова',
  published: 'Публикувано',
  cancelled: 'Отменено',
  completed: 'Завършено',
};

const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const RESET_STATUS_MODAL = {
  isOpen: false,
  eventId: null,
  currentStatus: null,
  eventTitle: '',
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, draft, published, cancelled, completed
  const [statusModal, setStatusModal] = useState(RESET_STATUS_MODAL);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents({});
      setEvents(data?.events || []);
    } catch (err) {
      console.error('Грешка при зареждане на събития:', err);
      showError('Грешка при зареждане на събития');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === 'published').length;
    const draft = events.filter((e) => e.status === 'draft').length;
    const cancelled = events.filter((e) => e.status === 'cancelled').length;
    const completed = events.filter((e) => e.status === 'completed').length;

    return { total, published, draft, cancelled, completed };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${eventTitle}"?`)) return;

    const promise = eventService.deleteEvent(eventId);

    showPromise(promise, {
      loading: 'Изтриване...',
      success: 'Събитието е изтрито успешно!',
      error: (err) => getApiErrorMessage(err, 'Request failed. Please try again.'),
    });

    try {
      await promise;
      fetchEvents();
    } catch {
      // handled by toast.promise
    }
  };

  const openStatusModal = (eventId, currentStatus, eventTitle) => {
    setStatusModal({
      isOpen: true,
      eventId,
      currentStatus,
      eventTitle,
    });
  };

  const closeStatusModal = () => {
    setStatusModal(RESET_STATUS_MODAL);
  };

  const handleChangeStatus = async (newStatus) => {
    const normalized = newStatus?.toLowerCase?.().trim?.() ?? newStatus;

    if (!STATUS_OPTIONS.includes(normalized)) {
      showError('Невалиден статус');
      return;
    }

    const promise = eventService.updateEvent(statusModal.eventId, {
      status: normalized,
    });

    showPromise(promise, {
      loading: 'Промяна на статус...',
      success: 'Статусът е променен успешно! ✅',
      error: (err) => getApiErrorMessage(err, 'Request failed. Please try again.'),
    });

    try {
      await promise;
      closeStatusModal();
      fetchEvents();
    } catch {
      // handled by toast.promise
    }
  };

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
        {/* Back button */}
        <Link
          to="/admin"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад към Admin Panel
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Управление на събития</h1>
          <p className="text-gray-600">Общо {stats.total} събития в системата</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Всички</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Публикувани</p>
              <p className="text-3xl font-bold text-green-600">{stats.published}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Чернови</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Отменени</p>
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </Card>
        </div>

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
              Всички ({stats.total})
            </button>

            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✓ Публикувани ({stats.published})
            </button>

            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Чернови ({stats.draft})
            </button>

            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✗ Отменени ({stats.cancelled})
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✓ Завършени ({stats.completed})
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
                {filteredEvents.map((event) => {
                  const organizerName = `${event.users?.first_name || ''} ${event.users?.last_name || ''}`.trim();
                  const organizerEmail = event.users?.email || '';

                  return (
                    <tr
                      key={event.id}
                      className="odd:bg-gray-100 even:bg-white hover:bg-gray-200"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            to={`/events/${event.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {event.title}
                          </Link>

                          <div className="text-sm text-gray-500">📍 {event.location}</div>

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
                        <div className="text-sm text-gray-900">{organizerName || '—'}</div>
                        <div className="text-sm text-gray-500">{organizerEmail || '—'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.event_date ? formatDate(event.event_date) : '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.event_date
                            ? formatTime(event.event_date)
                            : '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[event.status] || event.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.participantsCount || 0}
                        {event.max_participants ? ` / ${event.max_participants}` : ''}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link to={`/events/${event.id}`}>
                            <Button variant="outline" size="sm">👁️</Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusModal(event.id, event.status, event.title)}
                            title="Промени статус"
                          >
                            🔄
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            title="Изтрий"
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-gray-600">Няма събития с този филтър</div>
          )}
        </Card>
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        currentStatus={statusModal.currentStatus}
        eventTitle={statusModal.eventTitle}
        onConfirm={handleChangeStatus}
      />
    </div>
  );
};

export default AdminEventsPage;



