// src/pages/AdminStatisticsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';

const AdminStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch statistics
  const fetchStatistics = async () => {
    setLoading(true);

    try {
      const res = await api.get('/admin/statistics');
      setStats(res.data.statistics);
    } catch (err) {
      console.error('Грешка при зареждане на статистики:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Грешка при зареждане на статистики</p>
      </div>
    );
  }

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
            Статистики и отчети
          </h1>
          <p className="text-gray-600">Детайлни данни за цялата платформа</p>
        </div>

        {/* Users Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Статистики за потребители
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-blue-100 text-sm mb-2">Общо потребители</p>
              <p className="text-5xl font-bold">{stats.users.total}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Users</p>
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.users.byRole.user}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.users.byRole.user / stats.users.total) * 100).toFixed(1)}%
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Organizers</p>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.users.byRole.organizer}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.users.byRole.organizer / stats.users.total) * 100).toFixed(
                  1
                )}
                %
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Admins</p>
                <span className="text-2xl">👑</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.users.byRole.admin}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {((stats.users.byRole.admin / stats.users.total) * 100).toFixed(1)}%
              </p>
            </Card>
          </div>
        </div>

        {/* Events Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📅 Статистики за събития
          </h2>

          <div className="grid md:grid-cols-5 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-green-100 text-sm mb-2">Общо събития</p>
              <p className="text-5xl font-bold">{stats.events.total}</p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-2">Публикувани</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.events.byStatus.published}
              </p>
              <div className="mt-2 bg-green-100 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.events.byStatus.published / stats.events.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-2">Чернови</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.events.byStatus.draft}
              </p>
              <div className="mt-2 bg-yellow-100 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.events.byStatus.draft / stats.events.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-2">Отменени</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.events.byStatus.cancelled}
              </p>
              <div className="mt-2 bg-red-100 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.events.byStatus.cancelled / stats.events.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm mb-2">Завършени</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.events.byStatus.completed}
              </p>
              <div className="mt-2 bg-blue-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.events.byStatus.completed / stats.events.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </Card>
          </div>
        </div>

        {/* Registrations Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✓ Статистики за регистрации
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <p className="text-orange-100 text-sm mb-2">Общо регистрации</p>
              <p className="text-5xl font-bold">{stats.registrations.total}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Потвърдени</p>
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.registrations.confirmed}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(
                  (stats.registrations.confirmed / stats.registrations.total) *
                  100
                ).toFixed(1)}
                %
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Присъствали</p>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {stats.registrations.attended}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.registrations.confirmed > 0
                  ? (
                      (stats.registrations.attended /
                        stats.registrations.confirmed) *
                      100
                    ).toFixed(1)
                  : 0}
                % attendance rate
              </p>
            </Card>
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Ключови показатели
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Среден брой участници на събитие
              </h3>
              <p className="text-5xl font-bold text-primary-600">
                {stats.events.total > 0
                  ? (stats.registrations.confirmed / stats.events.total).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">участници/събитие</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Процент на присъствие
              </h3>
              <p className="text-5xl font-bold text-green-600">
                {stats.registrations.confirmed > 0
                  ? (
                      (stats.registrations.attended /
                        stats.registrations.confirmed) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600 mt-2">
                от записаните реално присъстват
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;