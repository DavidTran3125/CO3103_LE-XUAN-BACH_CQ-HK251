const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token; // lấy cookie từ request

  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token' });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn thông tin user vào req để dùng sau
    req.user = {
      id: decoded.user_id,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (err) {
    console.error('Token không hợp lệ:', err);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = authMiddleware;