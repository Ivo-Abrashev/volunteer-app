// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import api from '../services/api';

const HomePage = () => {
  const [stats, setStats] = useState({
    activeEvents: 0,
    volunteers: 0,
    cities: 0,
    hoursHelped: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const apiBaseUrl = api?.defaults?.baseURL || '/api';

    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/public/statistics`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!isMounted) return;
        setStats(data.statistics);
      } catch (error) {
        console.error('Failed to load public statistics:', error);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatStatValue = (value) => {
    if (statsLoading) {
      return '...';
    }
    const parsedValue = Number(value);
    const numberValue = Number.isFinite(parsedValue) ? parsedValue : 0;
    return numberValue.toLocaleString('bg-BG');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white">
        <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70 mb-4">
                Добре дошли
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 animate-fade-in">
                Доброволчеството променя средата
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/85 max-w-xl mb-8">
                Присъединете се към общност от хора с мисия. Открийте кауза, която има значение за
                вас, и вложете сила там, където е най-нужно.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
                    Стани доброволец
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/15 border border-white/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Каузи</p>
                <p className="text-lg font-semibold">Подкрепа за местни общности</p>
              </div>
              <div className="rounded-2xl bg-white/15 border border-white/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Локации</p>
                <p className="text-lg font-semibold">Събития близо до вас</p>
              </div>
              <div className="rounded-2xl bg-white/15 border border-white/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Ангажимент</p>
                <p className="text-lg font-semibold">Гъвкави графици и часове</p>
              </div>
              <div className="rounded-2xl bg-white/15 border border-white/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Резултат</p>
                <p className="text-lg font-semibold">Видима и трайна промяна</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-gray-900">
            Какво получавате като доброволец
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Смислени каузи</h3>
              <p className="text-gray-600">
                Откривате инициативи, които отговарят на интересите и времето ви.
              </p>
            </Card>

            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📌</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Проверена информация</h3>
              <p className="text-gray-600">
                Виждате ясни детайли за всяко събитие, организатор и локация.
              </p>
            </Card>

            <Card hover className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Подкрепяща общност</h3>
              <p className="text-gray-600">
                Свързвате се с хора със сходни ценности и работите заедно.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-primary-600 text-xs uppercase tracking-[0.3em] mb-3">За нас</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Платформа за реални доброволчески възможности
              </h2>
              <p className="text-gray-600 mt-4">
                Volunity свързва доброволци, организации и каузи в цялата страна. Ние
                осигуряваме прозрачна информация и улесняваме процеса по включване в значими
                инициативи.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  'Подкрепяме доверени организатори и ясни цели за всяка кауза.',
                  'Осигуряваме сигурен процес за участие и комуникация между всички страни.',
                  'Уважаваме времето и усилията на доброволците чрез ясни очаквания.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Какво стои в основата</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Лесен достъп до каузи',
                    text: 'Търсите, филтрирате и избирате събития според интересите си.',
                  },
                  {
                    title: 'Ясна и навременна информация',
                    text: 'Всяка кауза има описани цели, график и подробности за участниците.',
                  },
                  {
                    title: 'Реално въздействие',
                    text: 'Виждате резултатите от доброволческия труд и неговата стойност.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 border-primary-600 pl-4">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <img
                src="https://plus.unsplash.com/premium_photo-1681825054807-2e7bb610a6e7?q=80&w=1173&auto=format&fit=crop"
                alt="Доброволци на терен"
                className="w-full h-full object-cover min-h-[320px]"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Как работи платформата
              </h2>
              <p className="text-gray-600 mb-8">
                Процесът е кратък и ясен, за да се включите уверено.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: 'Открийте събитие',
                    text: 'Филтрирайте по категория, локация и дата.',
                  },
                  {
                    title: 'Запишете се',
                    text: 'Заявявате участие и получавате детайли за организацията.',
                  },
                  {
                    title: 'Участвайте и споделяйте',
                    text: 'Участвате и оставате активни в общността.',
                  },
                ].map((step, index) => (
                  <div key={step.title} className="relative pl-8">
                    {index < 2 && (
                      <span className="absolute left-[0.75rem] top-9 h-12 w-px bg-gradient-to-b from-primary-200 via-primary-400 to-primary-500" />
                    )}
                    <span className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white ring-2 ring-primary-600 shadow-sm flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                    </span>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-gray-900">
            Популярни категории
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Образование', emoji: '📚', color: 'from-green-400 to-green-600' },
              { name: 'Екология', emoji: '🌿', color: 'from-blue-400 to-blue-600' },
              { name: 'Социални', emoji: '🤝', color: 'from-purple-400 to-purple-600' },
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

      {/* Impact */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-white to-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Въздействие до момента
                </h2>
                <p className="text-gray-600 mt-2">
                  Показателите се обновяват автоматично спрямо реалните данни.
                </p>
              </div>
              <Link to="/events">
                <Button variant="outline" size="sm">
                  Виж активните каузи
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[
                {
                  label: 'Активни каузи',
                  value: formatStatValue(stats.activeEvents),
                  cardClass: 'from-green-200 via-green-300 to-green-200',
                  accentClass: 'text-emerald-900',
                },
                {
                  label: 'Доброволци',
                  value: formatStatValue(stats.volunteers),
                  cardClass: 'from-sky-200 via-sky-300 to-sky-200',
                  accentClass: 'text-sky-900',
                },
                {
                  label: 'Градове',
                  value: formatStatValue(stats.cities),
                  cardClass: 'from-amber-200 via-amber-300 to-amber-200',
                  accentClass: 'text-amber-900',
                },
                {
                  label: 'Часове помощ',
                  value: formatStatValue(stats.hoursHelped),
                  cardClass: 'from-violet-200 via-violet-300 to-violet-200',
                  accentClass: 'text-violet-900',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-xl bg-gradient-to-br ${stat.cardClass} border border-white/70 shadow-sm`}
                >
                  <div className={`text-2xl font-bold ${stat.accentClass}`}>{stat.value}</div>
                  <div className="text-gray-700 mt-1 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Готови ли сте да започнете?</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8 text-primary-100">
            Създайте акаунт и станете част от национална общност за добро.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="shadow-lg">
              Регистрирай се
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
