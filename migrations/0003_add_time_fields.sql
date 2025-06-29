-- 添加运动时间和打卡时间字段
ALTER TABLE sports_records ADD COLUMN exercise_time TIMESTAMP;
ALTER TABLE sports_records ADD COLUMN check_in_time TIMESTAMP; 