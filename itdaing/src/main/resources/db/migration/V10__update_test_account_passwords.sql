-- Update test accounts to use bcrypt hash for password "Test1234!"
UPDATE users
SET password = '$2b$10$RscD/JqdC5mAPtH2GkWDrez9KLi1lKi/xBTbxXyxCCWAOA1OtAgue',
    updated_at = CURRENT_TIMESTAMP(6)
WHERE login_id IN ('consumer1', 'seller1', 'admin1');
-- Align test account passwords with documented credential (Test1234!)
-- Hash generated via bcrypt (10 rounds)
-- Password hash: $2b$10$J3eFK.qr2/emyoHVP6HLD.M/eQKjeQ6OtPtWAGzUhhiu6gzBVhp1S

UPDATE users
SET password = '$2b$10$J3eFK.qr2/emyoHVP6HLD.M/eQKjeQ6OtPtWAGzUhhiu6gzBVhp1S',
    updated_at = CURRENT_TIMESTAMP(6)
WHERE login_id IN ('consumer1', 'seller1', 'admin1');


