// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Промени света с доброволчество! 🌟
            </h1>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Присъедини се към хиляди доброволци в България. Намери каузи които те вдъхновяват
              и направи разликата в твоята общност.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button variant="secondary" size="lg" className="shadow-lg">
                  Разгледай събития
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-50 border-white"
                >
                  Регистрирай се
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 transform -skew-y-2 origin-top-left"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Защо да станеш доброволец?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Създавай връзки
              </h3>
              <p className="text-gray-600">
                Запознай се с единомишленици и разшири социалната си мрежа докато правиш добро.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Развивай умения
              </h3>
              <p className="text-gray-600">
                Придобий нов опит, развий лидерски качества и обогати автобиографията си.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Прави промяна
              </h3>
              <p className="text-gray-600">
                Имай реален принос към обществото и бъди част от позитивната промяна.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Категории събития
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Екология', emoji: '🌍', color: 'from-green-400 to-green-600' },
              { name: 'Образование', emoji: '📚', color: 'from-blue-400 to-blue-600' },
              { name: 'Социални', emoji: '🤲', color: 'from-purple-400 to-purple-600' },
              { name: 'Култура', emoji: '🎨', color: 'from-pink-400 to-pink-600' },
            ].map((category) => (
              <Link key={category.name} to={`/events?category=${category.name.toLowerCase()}`}>
                <Card hover className="p-6 text-center cursor-pointer">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 text-3xl`}
                  >
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Готов да започнеш?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Създай акаунт и стани част от нашата доброволческа общност още днес!
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="shadow-lg">
              Регистрирай се безплатно
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;