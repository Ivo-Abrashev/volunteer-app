// src/pages/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import RoleChangeModal from '../components/common/RoleChangeModal';
import { showPromise } from '../utils/toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, user, organizer, admin
  const [roleModal, setRoleModal] = useState({
  isOpen: false,
  userId: null,
  currentRole: null,
  userName: '',
});

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Грешка при зареждане на потребители:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Change role
  // Отвори modal
  const openRoleModal = (userId, currentRole, userName) => {
    setRoleModal({
      isOpen: true,
      userId,
      currentRole,
      userName,
    });
  };
  // Промени ролята
  const handleChangeRole = async (newRole) => {
    const promise = api.put(`/admin/users/${roleModal.userId}/role`, {
      role: newRole,
    });

    showPromise(promise, {
      loading: 'Промяна на роля...',
      success: 'Ролята е променена успешно! ✅',
      error: (err) => err.response?.data?.message || 'Грешка при промяна на роля',
    });

    try {
      await promise;
      fetchUsers();
    } catch {
    // Error handled by toast.promise
    }
  };

  // Затвори modal
  const closeRoleModal = () => {
    setRoleModal({
      isOpen: false,
      userId: null,
      currentRole: null,
      userName: '',
    });
  };


  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Сигурни ли сте, че искате да изтриете потребител "${userName}"?\n\nТова действие е необратимо!`
      )
    ) {
      return;
    }

    const promise = api.delete(`/admin/users/${userId}`);

    showPromise(promise, {
      loading: 'Изтриване...',
      success: 'Потребителят е изтрит успешно!',
      error: (err) =>
        err.response?.data?.message || 'Грешка при изтриване на потребител',
    });

    try {
      await promise;
      fetchUsers();
    } catch {
      // Error handled by toast.promise
    }
  };

  // Filter users
  const filteredUsers =
    filter === 'all' ? users : users.filter((u) => u.role === filter);

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Управление на потребители
          </h1>
          <p className="text-gray-600">
            Общо {users.length} потребители в системата
          </p>
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
              Всички ({users.length})
            </button>
            <button
              onClick={() => setFilter('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👤 Users ({users.filter((u) => u.role === 'user').length})
            </button>
            <button
              onClick={() => setFilter('organizer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'organizer'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎯 Organizers ({users.filter((u) => u.role === 'organizer').length})
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'admin'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👑 Admins ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Потребител
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роля
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Създаден
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="odd:bg-gray-100 even:bg-white hover:bg-gray-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-3">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'organizer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('bg-BG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => 
                            openRoleModal(user.id, user.role, `${user.first_name} ${user.last_name}`

                            )
                          }
                        >
                          🔄 Роля
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteUser(
                              user.id,
                              `${user.first_name} ${user.last_name}`
                            )
                          }
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

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              Няма потребители с този филтър
            </div>
          )}
        </Card>
      </div>

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={roleModal.isOpen}
        onClose={closeRoleModal}
        currentRole={roleModal.currentRole}
        userName={roleModal.userName}
        onConfirm={handleChangeRole}
      />
    </div>
  );
};

export default AdminUsersPage;



