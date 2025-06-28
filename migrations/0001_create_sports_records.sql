-- 创建用户表
CREATE TABLE IF NOT EXISTS sports_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建运动记录表
CREATE TABLE IF NOT EXISTS sports_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sport_type TEXT NOT NULL,
    duration INTEGER NOT NULL, -- 运动时长（分钟）
    count INTEGER, -- 运动次数/个数（可选）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES sports_users(id)
); 