// src/components/common/StatusChangeModal.jsx
import { useState } from 'react';
import Button from './Button';

const StatusChangeModal = ({
  isOpen,
  onClose,
  currentStatus,
  eventTitle,
  onConfirm,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  if (!isOpen) return null;

  const statuses = [
    {
      value: 'draft',
      label: 'Чернова',
      icon: '📝',
      color: 'yellow',
      description: 'Видимо само за организатора',
    },
    {
      value: 'published',
      label: 'Публикувано',
      icon: '✓',
      color: 'green',
      description: 'Видимо за всички потребители',
    },
    {
      value: 'cancelled',
      label: 'Отменено',
      icon: '✗',
      color: 'red',
      description: 'Събитието е отменено',
    },
    {
      value: 'completed',
      label: 'Завършено',
      icon: '🏁',
      color: 'blue',
      description: 'Събитието вече е проведено',
    },
  ];

  const handleConfirm = () => {
    onConfirm(selectedStatus);
    onClose();
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      yellow: isSelected
        ? 'border-yellow-500 bg-yellow-50'
        : 'border-gray-200 hover:border-yellow-300',
      green: isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      red: isSelected
        ? 'border-red-500 bg-red-50'
        : 'border-gray-200 hover:border-red-300',
      blue: isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300',
    };
    return colors[color];
  };

  const getBadgeClasses = (status) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return badges[status];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Промяна на статус
          </h3>
          <p className="text-gray-600">
            Променете статуса на събитието{' '}
            <strong className="text-gray-900">"{eventTitle}"</strong>
          </p>
        </div>

        {/* Status Options */}
        <div className="space-y-3 mb-6">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${getColorClasses(
                status.color,
                selectedStatus === status.value
              )}`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{status.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{status.label}</p>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getBadgeClasses(
                        status.value
                      )}`}
                    >
                      {status.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{status.description}</p>
                </div>
                {selectedStatus === status.value && (
                  <span className="text-primary-600 font-bold text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Change Warning */}
        {currentStatus !== selectedStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              ℹ️ Статусът ще бъде променен от{' '}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getBadgeClasses(
                  currentStatus
                )}`}
              >
                {currentStatus}
              </span>{' '}
              на{' '}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getBadgeClasses(
                  selectedStatus
                )}`}
              >
                {selectedStatus}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={onClose}
            type="button"
          >
            Отказ
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={currentStatus === selectedStatus}
            type="button"
          >
            Потвърди промяната
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;