// src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);

    try {
      // Fetch users
      const usersRes = await api.get('/users');
      const users = usersRes.data.users;

      // Fetch events
      const eventsRes = await api.get('/events');
      const events = eventsRes.data.events;

      // Calculate stats
      setStats({
        totalUsers: users.length,
        totalOrganizers: users.filter((u) => u.role === 'organizer').length,
        totalEvents: events.length,
        totalRegistrations: events.reduce(
          (sum, e) => sum + (e.participantsCount || 0),
          0
        ),
      });

      // Recent users (последните 5)
      setRecentUsers(users.slice(0, 5));

      // Recent events (последните 5)
      setRecentEvents(events.slice(0, 5));
    } catch (err) {
      console.error('Грешка при зареждане на статистики:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
             Admin Panel
          </h1>
          <p className="text-gray-600">
            Добре дошли, {user?.firstName}! Управлявайте цялата платформа тук.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6 sm:mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Общо потребители</p>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl opacity-50">👥</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Организатори</p>
                <p className="text-4xl font-bold">{stats.totalOrganizers}</p>
              </div>
              <div className="text-5xl opacity-50">🎯</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Общо събития</p>
                <p className="text-4xl font-bold">{stats.totalEvents}</p>
              </div>
              <div className="text-5xl opacity-50">📅</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Регистрации</p>
                <p className="text-4xl font-bold">{stats.totalRegistrations}</p>
              </div>
              <div className="text-5xl opacity-50">✓</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6 sm:mb-8">
          <Link to="/admin/users">
            <Card
              hover
              className="p-6 text-center cursor-pointer bg-white hover:bg-primary-50 transition-colors"
            >
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Управление на потребители
              </h3>
              <p className="text-gray-600 text-sm">
                Преглед, редакция и промяна на роли
              </p>
            </Card>
          </Link>

          <Link to="/admin/events">
            <Card
              hover
              className="p-6 text-center cursor-pointer bg-white hover:bg-primary-50 transition-colors"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Управление на събития
              </h3>
              <p className="text-gray-600 text-sm">
                Преглед и редакция на всички събития
              </p>
            </Card>
          </Link>

          <Link to="/admin/statistics">
            <Card
              hover
              className="p-6 text-center cursor-pointer bg-white hover:bg-primary-50 transition-colors"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Статистики и отчети
              </h3>
              <p className="text-gray-600 text-sm">
                Детайлни данни и анализи
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Последни потребители
            </h2>
            <Card className="divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 odd:bg-gray-100 even:bg-white hover:bg-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-3">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'organizer'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}

              {recentUsers.length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  Няма потребители
                </div>
              )}

              <div className="p-4 text-center">
                <Link
                  to="/admin/users"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Виж всички потребители →
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Events */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Последни събития
            </h2>
            <Card className="divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 odd:bg-gray-100 even:bg-white hover:bg-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link
                        to={`/events/${event.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {event.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {event.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        👥 {event.participantsCount || 0} участници
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}

              {recentEvents.length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  Няма събития
                </div>
              )}

              <div className="p-4 text-center">
                <Link
                  to="/admin/events"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Виж всички събития →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
