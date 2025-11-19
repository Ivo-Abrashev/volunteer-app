// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware за проверка на JWT токен
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Провери дали има Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Вземи токена от header-а: "Bearer TOKEN_HERE"
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Провери дали токенът съществува
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Не сте логнат! Моля влезте в профила си.'
      });
    }

    // 3. Верифицирай токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Добави user данни към request обекта
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // 5. Продължи към следващата функция (controller)
    next();

  } catch (error) {
    console.error('Auth middleware грешка:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Невалиден токен!'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токенът е изтекъл! Моля влезте отново.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Грешка при автентикация'
    });
  }
};

// Middleware за проверка на роля
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Роля '${req.user.role}' няма достъп до този ресурс!`
      });
    }
    next();
  };
};