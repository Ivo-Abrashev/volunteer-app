// src/pages/EventsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import eventService from '../services/eventService';
import EventCard from '../components/events/EventCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { showSuccess, showError } from '../utils/toast';
import { getApiErrorMessage } from '../utils/apiError';


const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [myRegistrations, setMyRegistrations] = useState([]); // НОВО!
  
  const { isAuthenticated } = useAuth();

  // Филтри
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: 'published',
  });

  // Fetch събития
  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await eventService.getAllEvents(filters);
      setEvents(data.events);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Request failed. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch моите регистрации
  const fetchMyRegistrations = async () => {
    if (!isAuthenticated()) return;

    try {
      const data = await eventService.getMyRegistrations();
      const eventIds = data.registrations
        .filter((reg) => reg.status === 'confirmed')
        .map((reg) => reg.events.id);
      setMyRegistrations(eventIds);
    } catch (err) {
      console.error('Грешка при зареждане на регистрации:', err);
    }
  };

  // При промяна на филтри
  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, [filters]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: e.target.search.value };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ search: '', category: '', status: 'published' });
    setSearchParams({});
  };

  // Handle register
  const handleRegister = async (eventId) => {
    if (!isAuthenticated()) {
      showError('Моля влезте в профила си за да се запишете!');
      return;
    }

    try {
      await eventService.registerForEvent(eventId);
      showSuccess('Успешно се записахте за събитието!');
      fetchEvents();
      fetchMyRegistrations();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed. Please try again.'));
    }
  };

  // Handle unregister
  const handleUnregister = async (eventId) => {
    if (!confirm('Сигурни ли сте, че искате да се отпишете?')) {
      return;
    }

    try {
      await eventService.unregisterFromEvent(eventId);
      showSuccess('Успешно се отписахте от събитието');
      fetchEvents();
      fetchMyRegistrations();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed. Please try again.'));
    }
  };

  const categories = [
    { name: 'Всички', value: '' },
    { name: '🌍 Екология', value: 'екология' },
    { name: '📚 Образование', value: 'образование' },
    { name: '🤲 Социални', value: 'социални' },
    { name: '🎨 Култура', value: 'култура' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Доброволчески събития
          </h1>
          <p className="text-gray-600">
            Открийте каузи, които Ви вдъхновяват
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4">         
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                name="search"
                placeholder="🔍 Търси по заглавие или описание..."
                defaultValue={filters.search}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button type="submit" variant="primary">
                Търси
              </Button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.category === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Clear Filters */}
            {(filters.search || filters.category) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                ✕ Изчисти филтри
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {events.length > 0 ? (
              <>
                <div className="mb-4 text-gray-600">
                  Намерени {events.length} {events.length === 1 ? 'събитие' : 'събития'}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => {
                    const isRegistered = myRegistrations.includes(event.id);
                    
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        showActions={isAuthenticated()}
                        onRegister={!isRegistered ? handleRegister : null}
                        onUnregister={isRegistered ? handleUnregister : null}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Не са намерени събития
                </h3>
                <p className="text-gray-600 mb-6">
                  Опитайте с различни филтри или проверете по-късно
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  Изчисти филтрите
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
