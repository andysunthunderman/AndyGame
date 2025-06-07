-- 删除现有表（如果存在）
DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS player_locations;
DROP TABLE IF EXISTS users;

-- 创建用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,  -- 将存储加密后的密码
    nickname TEXT,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    status INTEGER DEFAULT 1  -- 1: 活跃, 0: 禁用
);

-- 创建游戏记录表
CREATE TABLE game_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_name TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    play_count INTEGER DEFAULT 1,
    play_date TEXT NOT NULL,
    play_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建位置信息表
CREATE TABLE player_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 