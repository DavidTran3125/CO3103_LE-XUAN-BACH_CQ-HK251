const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = 'your_jwt_secret_key';

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing email or password'
      });
    }

    const pool = await sql.connect(config);

    // Tìm user theo email (select thêm cột email)
    const result = await pool.request()
      .input('email', sql.VarChar(254), email)
      .query(`
        SELECT user_id, username, email, password_hash, first_name, last_name, Dob 
        FROM Users 
        WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Email không tồn tại' });
    }

    const user = result.recordset[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET,
    );

    // Gửi token qua cookie
    res.cookie('auth_token', token, {
      httpOnly: true,   // bảo mật, JS không đọc được
      secure: false,    // nếu chạy HTTPS thì đặt true
      sameSite: 'Strict'
    });

    // Trả về thông tin user
    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        Dob: user.Dob
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleLogin };