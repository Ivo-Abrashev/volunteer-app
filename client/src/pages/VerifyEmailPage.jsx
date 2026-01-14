import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');

    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Липсва token.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus('ok');
        setMessage(res.data?.message || 'Имейлът е потвърден успешно!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Грешка при потвърждение.');
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
      <Card className="max-w-sm sm:max-w-md md:max-w-lg w-full p-5 sm:p-6 md:p-8">
        {status === 'loading' && (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Потвърждаваме…</h1>
            <p className="text-sm sm:text-base text-gray-600">Моля изчакай.</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Готово ✅</h1>
            <p className="text-sm sm:text-base text-sm sm:text-base text-gray-600 mb-4 sm:mb-5">{message}</p>
            <Link to="/login">
              <Button variant="primary" fullWidth>Вход</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Проблем ❌</h1>
            <p className="text-sm sm:text-base text-sm sm:text-base text-gray-600 mb-4 sm:mb-5">{message}</p>
            <Link to="/verify-pending">
              <Button variant="outline" fullWidth>Изпрати нов линк</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;

