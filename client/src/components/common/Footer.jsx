// src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import logo64 from '../../assets/volunity-mark-64.png';
import logo128 from '../../assets/volunity-mark-128.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600" />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={logo64}
                  srcSet={`${logo64} 1x, ${logo128} 2x`}
                  alt="Volunity logo"
                  className="w-24 h-24 rounded-xl object-contain ring-1 ring-gray-200 bg-white"
                  loading="lazy"
                />
                <div className="text-sm text-gray-600">
                  <div className="font-semibold text-gray-900 text-xl">
                    Volunity<span className="text-primary-600">.bg</span>
                  </div>
                  <div className="text-xs text-gray-500">Доброволчество с кауза</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 max-w-sm">
                Свързваме доброволци, организации и каузи в цялата страна с ясна
                информация и реално въздействие.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Навигация
              </h3>
              <nav className="mt-4 space-y-2 text-sm text-gray-600">
                <Link to="/" className="block hover:text-primary-600">
                  Начало
                </Link>
                <Link to="/events" className="block hover:text-primary-600">
                  Събития
                </Link>
                <Link to="/register" className="block hover:text-primary-600">
                  Регистрация
                </Link>
                <Link to="/login" className="block hover:text-primary-600">
                  Вход
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Контакти и условия
              </h3>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <a href="mailto:volunityapp@gmail.com" className="block hover:text-primary-600">
                  volunityapp@gmail.com
                </a>
                <Link to="/privacy" className="block hover:text-primary-600">
                  Поверителност
                </Link>
                <Link to="/terms" className="block hover:text-primary-600">
                  Условия
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-gray-200/70 pt-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {currentYear} Volunity.bg. Всички права запазени.</span>
            <span>Създадено за общности с мисия.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
