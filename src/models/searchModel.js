const {connectDB,sql}= require('../config/db')

exports.search_id = async (
  userid,
  strength = 0,
  weak = 0,
  keyword_strength = null,
  keyword_weak = null
) => {
  try {
    const pool = await connectDB();
    // console.log(userid,strength,keyword_strength)
    const sqlStr = `
      SELECT DISTINCT u.*
      FROM User_Profile u
      LEFT JOIN Profile_Strength ps 
        ON u.User_ID = ps.User_ID
      LEFT JOIN Profile_Weakness pw
        ON u.User_ID = pw.User_ID
      WHERE u.User_ID = @id
        AND (
              @strength = 0
              OR ps.Strength LIKE '%' + @k_strength + '%'
            )
        AND (
              @weak = 0
              OR pw.Weakness LIKE '%' + @k_weak + '%'
            )
    `;

    const result = await pool.request()
      .input('id', sql.Int, userid)
      .input('strength', sql.Bit, strength)
      .input('weak', sql.Bit, weak)
      .input('k_strength', sql.NVarChar, keyword_strength)
      .input('k_weak', sql.NVarChar, keyword_weak)
      .query(sqlStr);

    return result.recordset;
  } catch (err) {
    throw err;
  }
};


exports.search_username = async (
  usernameKeyword = null,   // tìm username chứa từ khóa
  strength = 0,             // 0 = bỏ filter, 1 = lọc strength
  weak = 0,                 // 0 = bỏ filter, 1 = lọc weakness
  keyword_strength = null,  
  keyword_weak = null
) => {
  try {
    const pool = await connectDB();
    // console.log(usernameKeyword)
    // console.log(usernameKeyword,strength,keyword_strength)
    const sqlStr = `
        SELECT DISTINCT u.*
        FROM 
        (
            SELECT *
            FROM User_Profile
            WHERE Username LIKE '%' + @usernameKeyword + '%'
        ) u
        LEFT JOIN Profile_Strength ps 
            ON u.User_ID = ps.User_ID
        LEFT JOIN Profile_Weakness pw 
            ON u.User_ID = pw.User_ID
        WHERE (@strength = 0 OR ps.Strength LIKE '%' + @keyword_strength + '%')
            AND (@weak = 0 OR pw.Weakness LIKE '%' + @keyword_weak + '%')
    `;

    const result = await pool.request()
      .input('usernameKeyword', sql.NVarChar, usernameKeyword)
      .input('strength', sql.Bit, strength)
      .input('weak', sql.Bit, weak)
      .input('keyword_strength', sql.NVarChar, keyword_strength)
      .input('keyword_weak', sql.NVarChar, keyword_weak)
      .query(sqlStr);

    return result.recordset;
  } catch (err) {
    throw err;
  }
};


exports.filter_user = async (
  strength = 0,           // 0 = bỏ filter, 1 = lọc strength
  weak = 0,               // 0 = bỏ filter, 1 = lọc weakness
  keyword_strength = null,
  keyword_weak = null
) => {
  try {
    const pool = await connectDB();
    // console.log(strength,keyword_strength,weak,keyword_weak)
    const sqlStr = `
      SELECT DISTINCT u.*
      FROM User_Profile u
      LEFT JOIN Profile_Strength ps
        ON u.User_ID = ps.User_ID
      LEFT JOIN Profile_Weakness pw
        ON u.User_ID = pw.User_ID
      WHERE (@strength = 0 OR ps.Strength = @keyword_strength)
        AND (@weak = 0 OR pw.Weakness = @keyword_weak)
    `;

    const result = await pool.request()
      .input('strength', sql.Bit, strength)
      .input('weak', sql.Bit, weak)
      .input('keyword_strength', sql.NVarChar, keyword_strength)
      .input('keyword_weak', sql.NVarChar, keyword_weak)
      .query(sqlStr);

    return result.recordset;
  } catch (err) {
    throw err;
  }
};
