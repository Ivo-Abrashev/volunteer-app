// src/utils/helpers.js

// Форматиране на дата
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Проверка дали събитие е минало
export const isPastEvent = (dateString) => {
  return new Date(dateString) < new Date();
};

// Изчисли оставащи дни
export const getDaysUntil = (dateString) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Минало';
  if (diffDays === 0) return 'Днес';
  if (diffDays === 1) return 'Утре';
  return `След ${diffDays} дни`;
};

// Съкрати текст
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Категория emoji
export const getCategoryEmoji = (category) => {
  const emojis = {
    екология: '🌍',
    образование: '📚',
    социални: '🤲',
    култура: '🎨',
  };
  return emojis[category?.toLowerCase()] || '📅';
};

// Категория цвят
export const getCategoryColor = (category) => {
  const colors = {
    екология: 'bg-green-100 text-green-800',
    образование: 'bg-blue-100 text-blue-800',
    социални: 'bg-purple-100 text-purple-800',
    култура: 'bg-pink-100 text-pink-800',
  };
  return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};