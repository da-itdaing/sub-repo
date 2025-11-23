-- 테스트 계정 비밀번호 초기화 스크립트
-- ---------------------------------------------------------------
-- 모든 테스트 계정(admin1 / seller1 / consumer1)의 비밀번호를
-- 고정 문자열(Test1234!)의 BCrypt 해시로 재설정합니다.
--
-- ✅ 사용 방법
--   PGPASSWORD=<db_password> psql \
--     -h <db_host> -p <db_port> -U <db_user> -d <db_name> \
--     -f scripts/update-passwords.sql
--
-- ⚠️ 주의
--   • 운영 계정에는 절대 사용하지 마십시오.
--   • 반드시 VPN/Private EC2 안에서만 실행하세요.
--   • 해시 문자열은 고정 값입니다. (salt 포함)
--

-- BCrypt 해시 생성 근거:
-- python3 - <<'PY'
-- import bcrypt
-- password = b'Test1234!'
-- salt = b'$2b$10$C6UzMDM.H6dfI/f/IKcEeO'
-- print(bcrypt.hashpw(password, salt).decode())
-- PY

BEGIN;

UPDATE users
SET password = '$2b$10$C6UzMDM.H6dfI/f/IKcEeO3Y7aWTJOT7z9na4cLsCQb8rUAT80/8a'
WHERE login_id IN ('admin1', 'seller1', 'consumer1');

COMMIT;

-- sanity check
SELECT login_id, LEFT(password, 4) AS hash_prefix
FROM users
WHERE login_id IN ('admin1', 'seller1', 'consumer1');

