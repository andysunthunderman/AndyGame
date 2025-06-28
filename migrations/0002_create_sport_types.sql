-- 创建运动类型表
CREATE TABLE IF NOT EXISTS sport_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认的运动类型数据
INSERT INTO sport_types (value, label, description) VALUES
('jump_rope', '跳绳', '增强心肺功能和协调性的有氧运动'),
('running', '跑步', '最基础的有氧运动，可以提高心肺功能'),
('swimming', '游泳', '全身性运动，对关节压力小'),
('martial_arts', '武术', '锻炼身体协调性和力量的传统运动'),
('dance', '舞蹈', '充满艺术性的有氧运动'),
('tennis', '网球', '既能锻炼反应速度又能增强体能的球类运动'),
('badminton', '羽毛球', '适合各年龄段的休闲运动'),
('ping_pong', '乒乓球', '需要快速反应和良好手眼协调的运动'); 