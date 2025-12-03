const sql = require('mssql');
const config = require('../config');

async function handleSearchUser(req, res) {
  try {
    const currentUserId = req.user.id;
    const { strengths, weaknesses } = req.body;

    if ((!strengths || strengths.length === 0) && (!weaknesses || weaknesses.length === 0)) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một điểm mạnh hoặc điểm yếu để tìm kiếm' });
    }

    const pool = await sql.connect(config);

    // Tổng số điểm người dùng chọn
    const totalSelected = (strengths?.length || 0) + (weaknesses?.length || 0);
    const threshold = Math.floor(totalSelected * 0.6);

    // Query mới dùng OUTER APPLY thay cho HAVING
    const query = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.Dob,
             ISNULL(s.matchStrengths,0) + ISNULL(w.matchWeaknesses,0) AS matchCount
      FROM Users u
      OUTER APPLY (
          SELECT COUNT(*) AS matchStrengths
          FROM UserStrengths us
          JOIN StrengthOptions so ON us.option_id = so.option_id
          WHERE us.user_id = u.user_id
            AND so.option_name IN (${strengths && strengths.length > 0 ? strengths.map((_, i) => `@strength${i}`).join(',') : 'NULL'})
      ) s
      OUTER APPLY (
          SELECT COUNT(*) AS matchWeaknesses
          FROM UserWeaknesses uw
          JOIN WeaknessOptions wo ON uw.option_id = wo.option_id
          WHERE uw.user_id = u.user_id
            AND wo.option_name IN (${weaknesses && weaknesses.length > 0 ? weaknesses.map((_, i) => `@weakness${i}`).join(',') : 'NULL'})
      ) w
      WHERE u.user_id <> @currentUserId
        AND (ISNULL(s.matchStrengths,0) + ISNULL(w.matchWeaknesses,0)) >= @threshold
      ORDER BY matchCount DESC;
    `;

    const request = pool.request();
    request.input('currentUserId', sql.Int, currentUserId);
    request.input('threshold', sql.Int, threshold);

    if (strengths) {
      strengths.forEach((s, i) => {
        request.input(`strength${i}`, sql.NVarChar(50), s);
      });
    }

    if (weaknesses) {
      weaknesses.forEach((w, i) => {
        request.input(`weakness${i}`, sql.NVarChar(50), w);
      });
    }

    const result = await request.query(query);

    // Gộp họ tên để tiện hiển thị
    const users = result.recordset.map(u => ({
      user_id: u.user_id,
      full_name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      dob: u.Dob,
      matchCount: u.matchCount
    }));

    res.status(200).json({ users });
  } catch (err) {
    console.error('Lỗi khi tìm kiếm user:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
  }
}

module.exports = { handleSearchUser };