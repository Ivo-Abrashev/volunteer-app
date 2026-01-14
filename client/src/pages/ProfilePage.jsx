// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { showSuccess, showError } from '../utils/toast';


const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile'); // profile, password

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await authService.getCurrentUser();
        const userData = data.user;

        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth
            ? userData.dateOfBirth.split('T')[0]
            : '',
        });
      } catch (err) {
        console.error('Грешка при зареждане на профил:', err);
      }
    };

    loadUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
      });

      // Update localStorage
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showSuccess('Профилът е обновен успешно! ✅');
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Грешка при обновяване на профил',
      });
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Паролата трябва да е поне 6 символа' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Паролите не съвпадат' });
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showSuccess('Паролата е променена успешно! ✅');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Грешка при промяна на парола',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Сигурни ли сте, че искате да изтриете профила си?\n\nТова действие е НЕОБРАТИМО!\n\nВсички ваши данни, събития и регистрации ще бъдат изтрити.'
      )
    ) {
      return;
    }

    const confirmation = prompt(
      'За потвърждение, напишете "ИЗТРИЙ" (с главни букви):'
    );

    if (confirmation !== 'ИЗТРИЙ') {
      showError('Изтриването е отменено');
      return;
    }

    try {
      await api.delete('/users/profile');
      showSuccess('Профилът е изтрит');
      logout();
      navigate('/');
    } catch (err) {
      showError(err.response?.data?.message || 'Грешка при изтриване на профил');
    }
  };

  const roleNames = {
    user: 'Доброволец',
    organizer: 'Организатор',
    admin: 'Администратор',
  };

  const roleBadges = {
    user: 'bg-blue-100 text-blue-800',
    organizer: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 lg:py-12 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-3xl sm:mr-6">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-3xl sm:text-3xl sm:text-4xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    roleBadges[user?.role]
                  }`}
                >
                  {roleNames[user?.role]}
                </span>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Личен профил
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔒 Сигурност
              </button>
              <button
                onClick={() => setActiveTab('danger')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'danger'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚠️ Danger Zone
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Редактирай профил
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{errors.general}</p>
                </div>
              )}

              {/* First Name & Last Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Име"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Фамилия"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
              </div>

              {/* Email (disabled) */}
              <Input
                label="Email адрес"
                type="email"
                name="email"
                value={formData.email}
                disabled
              />
              <p className="text-sm text-gray-600 -mt-4">
                Email адресът не може да се променя
              </p>

              {/* Phone */}
              <Input
                label="Телефон"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+359 888 123 456"
              />

              {/* Date of Birth */}
              <Input
                label="Дата на раждане"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Запазване...' : '💾 Запази промените'}
              </Button>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Промяна на парола
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{errors.general}</p>
                </div>
              )}

              {/* Current Password */}
              <Input
                label="Текуща парола"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={errors.currentPassword}
                required
              />

              {/* New Password */}
              <Input
                label="Нова парола"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                placeholder="Минимум 6 символа"
                required
              />

              {/* Confirm Password */}
              <Input
                label="Потвърди нова парола"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                required
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Промяна...' : '🔒 Промени паролата'}
              </Button>
            </form>
          </Card>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <Card className="p-5 sm:p-8 border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-600 mb-6">
              Необратими действия. Моля бъдете внимателни.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Изтриване на профил
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Веднъж изтрит, профилът не може да бъде възстановен. Всички ваши
                    данни, събития и регистрации ще бъдат перманентно изтрити.
                  </p>
                  <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                    <li>Личните ви данни ще бъдат изтрити</li>
                    <li>Всички създадени събития ще бъдат изтрити</li>
                    <li>Регистрациите ви за събития ще бъдат изтрити</li>
                    <li>Това действие е НЕОБРАТИМО</li>
                  </ul>
                </div>
              </div>

              <Button
                variant="danger"
                size="lg"
                onClick={handleDeleteAccount}
                fullWidth
              >
                🗑️ Изтрий профила завинаги
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

