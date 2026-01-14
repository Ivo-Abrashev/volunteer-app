import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const VerifyPendingPage = () => {
  const [email, setEmail] = useState('');

  const handleResend = async () => {
    if (!email) return toast.error('Въведи имейл');

    const promise = api.post('/auth/resend-verification', { email });

    toast.promise(promise, {
      loading: 'Изпращане...',
      success: (res) => res.data?.message || 'Изпратихме линк!',
      error: (err) => err.response?.data?.message || 'Грешка при изпращане',
    });

    try {
      await promise;
    } catch {
      // Error is handled by toast.promise
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
      <Card className="max-w-sm sm:max-w-md md:max-w-lg w-full p-5 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Потвърди имейла си</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5">
          Изпратихме Ви имейл с линк за потвърждение. Докато не потвърдите, няма да имате достъп.
        </p>

        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Имейл (за повторно изпращане)</label>
        <input
          className="w-full border rounded-lg px-3 py-2 sm:py-2.5 mb-3 sm:mb-4 text-sm sm:text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />

        <Button variant="primary" fullWidth onClick={handleResend}>
          Изпрати линка отново
        </Button>

        <div className="text-xs sm:text-sm text-gray-600 text-center mt-4 sm:mt-5">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Върни се към вход
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default VerifyPendingPage;

