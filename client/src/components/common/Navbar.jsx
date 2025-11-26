// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
              V
            </div>
            <span className="text-xl font-bold text-gray-900">
              Доброволци<span className="text-primary-600">.bg</span>
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
                      Моите събития
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
                      Моите събития
                    </Link>
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Dashboard
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
            <button className="text-gray-700 hover:text-primary-600">
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
    </nav>
  );
};

export default Navbar;