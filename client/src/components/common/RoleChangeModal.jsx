// src/components/common/RoleChangeModal.jsx
import { useState } from 'react';
import Button from './Button';

const RoleChangeModal = ({ isOpen, onClose, currentRole, userName, onConfirm }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  if (!isOpen) return null;

  const roles = [
    { value: 'user', label: 'Доброволец (User)', icon: '👤', color: 'blue' },
    { value: 'organizer', label: 'Организатор (Organizer)', icon: '🎯', color: 'purple' },
    { value: 'admin', label: 'Администратор (Admin)', icon: '👑', color: 'red' },
  ];

  const handleConfirm = () => {
    onConfirm(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Промяна на роля
          </h3>
          <p className="text-gray-600">
            Променете ролята на <strong>{userName}</strong>
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === role.value
                  ? `border-${role.color}-600 bg-${role.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{role.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{role.label}</p>
                  <p className="text-sm text-gray-600">
                    {role.value === 'user' && 'Може да се записва за събития'}
                    {role.value === 'organizer' &&
                      'Може да създава и управлява събития'}
                    {role.value === 'admin' && 'Пълен контрол върху платформата'}
                  </p>
                </div>
                {selectedRole === role.value && (
                  <span className="text-primary-600 font-bold text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Current Role Info */}
        {currentRole !== selectedRole && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Ролята ще бъде променена от <strong>{currentRole}</strong> на{' '}
              <strong>{selectedRole}</strong>
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
            disabled={currentRole === selectedRole}
            type="button"
          >
            Потвърди промяната
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;