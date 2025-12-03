const sql = require('mssql');
const bcrypt = require('bcrypt');
const config = require('../config');

async function handleRegister(req, res) {
  try {
    const { username, password, first_name, last_name, email, Dob } = req.body;

    if (!username || !password || !first_name || !last_name || !email || !Dob) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: username, first_name, last_name, email, password, Dob'
      });
    }

    const pool = await sql.connect(config);

    const checkResult = await pool.request()
      .input('username', sql.NVarChar(30), username)
      .input('email', sql.VarChar(254), email)
      .query('SELECT user_id FROM Users WHERE username = @username OR email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Username or email already exists'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const insertResult = await pool.request()
      .input('username', sql.NVarChar(30), username)
      .input('password_hash', sql.VarChar(255), password_hash)
      .input('first_name', sql.NVarChar(30), first_name)
      .input('last_name', sql.NVarChar(50), last_name)
      .input('email', sql.VarChar(254), email)
      .input('Dob', sql.Date, Dob)
      .query(`
        INSERT INTO Users (username, password_hash, first_name, last_name, email, Dob)
        OUTPUT INSERTED.user_id
        VALUES (@username, @password_hash, @first_name, @last_name, @email, @Dob)
      `);

    const userId = insertResult.recordset[0].user_id;

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        username,
        first_name,
        last_name,
        email,
        Dob
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleRegister };