// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user', // НОВО!
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Изчисти грешката за това поле
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email е задължителен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невалиден email адрес';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Паролата е задължителна';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Паролата трябва да е поне 6 символа';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролите не съвпадат';
    }

    // First name
    if (!formData.firstName) {
      newErrors.firstName = 'Името е задължително';
    }

    // Last name
    if (!formData.lastName) {
      newErrors.lastName = 'Фамилията е задължителна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    // exclude confirmPassword from the payload; rename the extracted variable to start with an underscore
    // so it is allowed to be unused by the linter
    const { confirmPassword: _confirmPassword, ...registerData } = formData;
    // role вече е включена в registerData ✅
    const result = await register(registerData);

    if (result.success) {
      navigate('/events');
    } else {
      setErrors({ general: result.error });
    }
  } catch {
    setErrors({ general: 'Възникна грешка. Моля опитайте отново.' });
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
          <h2 className="text-3xl font-bold text-gray-900">Създай акаунт</h2>
          <p className="mt-2 text-gray-600">Присъедини се към нашата общност</p>
        </div>

        {/* Register Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Email */}
            <Input
              label="Email адрес"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              error={errors.email}
              required
            />

            {/* Phone */}
            <Input
              label="Телефон"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+359 888 123 456"
            />

            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Искам да съм: <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="user">👤 Доброволец (User)</option>
                <option value="organizer">🎯 Организатор (Organizer)</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Организаторите могат да създават събития и организации
              </p>
            </div>

            {/* Password */}
            <Input
              label="Парола"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 6 символа"
              error={errors.password}
              required
            />

            {/* Confirm Password */}
            <Input
              label="Потвърди парола"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Въведи паролата отново"
              error={errors.confirmPassword}
              required
            />

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
              />
              <label className="ml-2 text-sm text-gray-700">
                Съгласен съм с{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Общите условия
                </a>{' '}
                и{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Политиката за поверителност
                </a>
              </label>
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
                  Регистрация...
                </div>
              ) : (
                'Създай акаунт'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Вече имате профил?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Влезте тук
              </Link>
            </p>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>🔒 Вашите данни са защитени и сигурни</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;