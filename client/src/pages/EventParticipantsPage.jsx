// src/pages/EventParticipantsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { showSuccess, showError } from '../utils/toast';


const EventParticipantsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch participants
  const fetchParticipants = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await eventService.getEventParticipants(id);
      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Грешка при зареждане на участници'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  // Mark attendance
  const handleMarkAttendance = async (registrationId, attended) => {
    try {
      await eventService.markAttendance(registrationId, attended);
      showSuccess(
        attended
          ? 'Присъствието е маркирано ✅'
          : 'Отсъствието е маркирано'
      );
      fetchParticipants(); // Refresh
    } catch (err) {
      showError(err.response?.data?.message || 'Грешка при маркиране');
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
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Грешка при зареждане
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard">
            <Button variant="primary">Назад към Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const confirmedParticipants = data.participants.filter(
    (p) => p.status === 'confirmed'
  );
  const cancelledParticipants = data.participants.filter(
    (p) => p.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/dashboard"
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
          Назад към Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Участници на събитието
          </h1>
          <p className="text-gray-600 text-lg">"{data.event.title}"</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Общо</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.stats.total}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Записани</p>
              <p className="text-3xl font-bold text-green-600">
                {data.stats.confirmed}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Отменени</p>
              <p className="text-3xl font-bold text-red-600">
                {data.stats.cancelled}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Присъствали</p>
              <p className="text-3xl font-bold text-blue-600">
                {data.stats.attended}
              </p>
            </div>
          </Card>
        </div>

        {/* Confirmed Participants */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Записани участници ({confirmedParticipants.length})
          </h2>

          {confirmedParticipants.length > 0 ? (
            <div className="space-y-3">
              {confirmedParticipants.map((participant) => (
                <Card key={participant.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-4">
                        {participant.users.first_name[0]}
                        {participant.users.last_name[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {participant.users.first_name}{' '}
                          {participant.users.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.users.email}
                        </p>
                        {participant.users.phone && (
                          <p className="text-sm text-gray-600">
                            📞 {participant.users.phone}
                          </p>
                        )}
                      </div>

                      {/* Registration Date */}
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600">Записан на</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            participant.registered_at
                          ).toLocaleDateString('bg-BG')}
                        </p>
                      </div>

                      {/* Attendance Badge */}
                      {participant.attended ? (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ✓ Присъствал
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                          Не е маркиран
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-2">
                      {!participant.attended ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(participant.id, true)
                          }
                        >
                          ✓ Присъствал
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(participant.id, false)
                          }
                        >
                          ✗ Отмени
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Все още няма записани участници</p>
            </Card>
          )}
        </div>

        {/* Cancelled Participants */}
        {cancelledParticipants.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Отменени регистрации ({cancelledParticipants.length})
            </h2>

            <div className="space-y-3">
              {cancelledParticipants.map((participant) => (
                <Card key={participant.id} className="p-4 bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold mr-4">
                      {participant.users.first_name[0]}
                      {participant.users.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">
                        {participant.users.first_name}{' '}
                        {participant.users.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {participant.users.email}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      Отменен
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex gap-3">
          <Link to={`/events/${id}`} className="flex-1">
            <Button variant="outline" fullWidth>
              👁️ Преглед на събитието
            </Button>
          </Link>
          <Link to={`/dashboard/events/${id}/edit`} className="flex-1">
            <Button variant="primary" fullWidth>
              ✏️ Редактирай събитието
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventParticipantsPage;