// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Изчисти грешката при писане
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        // Успешен login - redirect според роля
        const role = result.data.user.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'organizer') {
          navigate('/dashboard');
        } else {
          navigate('/events');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error(err);
      setError('Възникна грешка. Моля опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
            V
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Добре дошли отново!</h2>
          <p className="mt-2 text-gray-600">Влезте в профила си</p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <Input
              label="Email адрес"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />

            {/* Password */}
            <Input
              label="Парола"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">Запомни ме</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Забравена парола?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Влизане...
                </div>
              ) : (
                'Вход'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">или</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нямате профил?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Регистрирайте се
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Accounts */}
        <Card className="mt-4 p-4 bg-blue-50 border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">🧪 Тестови акаунти:</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p>👤 User: user@test.bg / test123</p>
            <p>🎯 Organizer: organizer@test.bg / test123</p>
            <p>⚡ Admin: admin@test.bg / admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;