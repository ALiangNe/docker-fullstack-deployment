var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');


// 使用 Docker Compose 中的服务名 'db' 连接
const dbConfig = {
host: 'mysql-db-llq',
user: 'root',
port: 3306,
password: 'sqlset1010',
database: 'userdb'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

/* GET users listing. */
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
