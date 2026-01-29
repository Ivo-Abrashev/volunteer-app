// src/components/common/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import logo64 from '../../assets/volunity-mark-64.png';
import logo128 from '../../assets/volunity-mark-128.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo64}
              srcSet={`${logo64} 1x, ${logo128} 2x`}
              alt="Volunity logo"
              className="w-28 h-28 rounded-lg object-contain shrink-0"
              loading="lazy"
            />
            <span className="text-2xl font-bold text-gray-900 leading-none -ml-4">
              Volunity<span className="text-primary-600">.bg</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Начало
            </Link>
            <Link
              to="/events"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Събития
            </Link>

            {isAuthenticated() ? (
              <>
                {/* User menu */}
                {user?.role === 'user' && (
                  <>
                    <Link
                      to="/my-events"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Моите участия
                    </Link>
                  </>
                )}

                {/* Organizer menu */}
                {user?.role === 'organizer' && (
                  <>
                    <Link
                      to="/my-events"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Моите участия 
                    </Link>
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Организаторски панел
                    </Link>
                  </>
                )}

                {/* Admin menu */}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Admin Panel
                    </Link>
                  </>
                )}

                {/* User profile dropdown */}
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Link>

                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Изход
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Вход
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-primary-600"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Начало
            </Link>
            <Link
              to="/events"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Събития
            </Link>

            {isAuthenticated() ? (
              <>
                {user?.role === 'user' && (
                  <Link
                    to="/my-events"
                    className="block text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Моите участия
                  </Link>
                )}

                {user?.role === 'organizer' && (
                  <>
                    <Link
                      to="/my-events"
                      className="block text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Моите участия
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Организаторски панел
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Изход
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>
                    Вход
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>
                    Регистрация
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
