// src/pages/CreateEventPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LocationInput from '../components/common/LocationInput'; 
import { showSuccess } from '../utils/toast';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    location: '',
    eventDate: '',
    duration: '',
    maxParticipants: '',
    category: '',
    imageUrl: '',
    status: 'draft',
  });

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

    if (!formData.title) newErrors.title = 'Заглавието е задължително';
    if (!formData.description)
      newErrors.description = 'Описанието е задължително';
    if (!formData.location) newErrors.location = 'Локацията е задължителна';
    if (!formData.eventDate) newErrors.eventDate = 'Датата е задължителна';

    // Провери дали датата е в бъдещето
    if (formData.eventDate) {
      const selectedDate = new Date(formData.eventDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.eventDate = 'Датата трябва да е в бъдещето';
      }
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
      const eventData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : null,
      };

      await eventService.createEvent(eventData);

      showSuccess('Събитието е създадено успешно! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Грешка при създаване на събитие',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['екология', 'образование', 'социални', 'култура'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Създай ново събитие
          </h1>
          <p className="text-gray-600">
            Попълнете информацията за вашето доброволческо събитие
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            {/* Title */}
            <Input
              label="Заглавие на събитието"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="напр. Почистване на парк"
              required
            />

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Опишете събитието, какво ще правите, какво е необходимо..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Изберете категория</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <LocationInput
              label="Локация"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onLocationSelect={(location) => {
                setFormData((prev) => ({
                  ...prev,
                  location: location.address,
                  latitude: location.lat,
                  longitude: location.lng,
                }));
              }}
              error={errors.location}
              required
            />

            {/* Date & Time */}
            <Input
              label="Дата и час"
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              error={errors.eventDate}
              required
            />

            {/* Duration & Max Participants */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Продължителност (минути)"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="напр. 120"
              />

              <Input
                label="Максимален брой участници"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="напр. 30"
              />
            </div>

            {/* Image URL */}
            <Input
              label="URL на снимка (опционално)"
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="draft">Чернова (видимо само за вас)</option>
                <option value="published">
                  Публикувано (видимо за всички)
                </option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Можете да създадете като чернова и да публикувате по-късно
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Създаване...
                  </div>
                ) : (
                  'Създай събитие'
                )}
              </Button>

              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" size="lg" fullWidth type="button">
                  Отказ
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateEventPage;