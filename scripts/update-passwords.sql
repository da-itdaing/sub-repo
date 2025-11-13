-- 비밀번호 해시 업데이트 스크립트
-- 주의: 이 해시는 "pass!1234"를 BCrypt로 인코딩한 것입니다
-- 실제 운영 환경에서는 백엔드에서 생성한 해시를 사용해야 합니다

-- BCrypt 해시 생성 방법:
-- Spring Boot 애플리케이션에서 BCryptPasswordEncoder를 사용하여 생성
-- 예: passwordEncoder.encode("pass!1234")

-- 임시 해시 (테스트용 - 실제로는 백엔드에서 생성해야 함)
-- 이 해시는 DevDataSeed에서 사용하는 것과 동일한 방식으로 생성되어야 합니다

-- 기존 해시 확인
SELECT login_id, LEFT(password, 30) as password_prefix FROM users WHERE login_id IN ('admin1', 'seller1', 'consumer1');

-- 비밀번호 해시는 백엔드에서 생성해야 하므로, 여기서는 확인만 수행
-- 실제 업데이트는 백엔드 애플리케이션을 통해 수행해야 합니다

