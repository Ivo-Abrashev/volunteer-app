import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const EventCard = ({
  event,
  showActions = false,
  isRegistered = false,
  onRegister,
  onUnregister,
}) => {
  // Форматиране на дата
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Категория цветове
  const categoryColors = {
    екология: 'bg-green-100 text-green-800',
    образование: 'bg-blue-100 text-blue-800',
    социални: 'bg-purple-100 text-purple-800',
    култура: 'bg-pink-100 text-pink-800',
  };

  const categoryColor =
    categoryColors[event.category?.toLowerCase()] || 'bg-gray-100 text-gray-800';

  // Status badge
  const statusBadge = {
    draft: { text: 'Чернова', color: 'bg-gray-100 text-gray-800' },
    published: { text: 'Публикувано', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Отменено', color: 'bg-red-100 text-red-800' },
    completed: { text: 'Завършено', color: 'bg-blue-100 text-blue-800' },
  };

  const status = statusBadge[event.status] || statusBadge.draft;
  const descriptionPreview = (() => {
    const description = event.description || '';
    const maxLength = 180;

    if (description.length <= maxLength) {
      return description;
    }

    return `${description.slice(0, maxLength).trim()}...`;
  })();
  const descriptionClampStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <Card hover className="overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="h-48 bg-gradient-to-r from-primary-400 to-secondary-400 relative overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            {event.category === 'екология' && '🌍'}
            {event.category === 'образование' && '📚'}
            {event.category === 'социални' && '🤲'}
            {event.category === 'култура' && '🎨'}
            {!event.category && '📅'}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}
          >
            {event.category || 'Общо'}
          </span>
        </div>

        {/* Status Badge (ако е различен от published) */}
        {event.status !== 'published' && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
            >
              {status.text}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Organization */}
        {event.organizations && (
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <span className="mr-1">🏢</span>
            {event.organizations.name}
          </p>
        )}

        {/* Description */}
        <p
          className="text-gray-600 text-sm mb-4 line-clamp-3"
          style={descriptionClampStyle}
        >
          {descriptionPreview}
        </p>

        {/* Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {/* Date */}
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span>{formatDate(event.event_date)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Participants */}
          {event.max_participants && (
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>
                {event.participantsCount || 0} / {event.max_participants} участници
              </span>
            </div>
          )}

          {/* Duration */}
          {event.duration && (
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>{event.duration} минути</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link to={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              Виж повече
            </Button>
          </Link>

          {showActions && (
            <>
              {!isRegistered && onRegister && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRegister(event.id)}
                  className="flex-1"
                >
                  Запиши се
                </Button>
              )}

              {isRegistered && onUnregister && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onUnregister(event.id)}
                  className="flex-1"
                >
                  Отпиши се
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
