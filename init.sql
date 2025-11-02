--删除数据库
DROP DATABASE userdb;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS userdb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始数据
INSERT INTO users (name, email) VALUES 
('zhangsan', 'zhangsan@example.com'),
('lisi', 'lisi@example.com');

INSERT INTO users (name, email) VALUES 
('luliangqiang', 'luliangqiang@qq.com');