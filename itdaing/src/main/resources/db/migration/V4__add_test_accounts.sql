-- 테스트 계정 생성
-- 비밀번호: Test1234! (모든 계정 동일)
-- BCrypt 해시: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--
-- 주의: 이미 존재하는 login_id가 있으면 건너뜁니다 (ON CONFLICT DO NOTHING)
-- 기존 계정의 정보는 변경되지 않습니다.
-- login_id가 unique constraint이므로, 이미 존재하는 계정은 자동으로 건너뜁니다.

-- Consumer 계정
INSERT INTO users (login_id, password, name, nickname, email, age_group, mbti, role, created_at, updated_at)
VALUES (
    'consumer1',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '테스트 소비자',
    '소비자1',
    'consumer1@test.com',
    20,
    'ENFP',
    'CONSUMER',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
)
ON CONFLICT (login_id) DO NOTHING;

-- Consumer 선호 정보 추가 (마스터 데이터가 존재하는 경우에만)
-- 카테고리 선호 (CONSUMER 타입 카테고리 중 첫 번째, 두 번째가 있다고 가정)
INSERT INTO user_pref_category (user_id, category_id, created_at, updated_at)
SELECT u.id, c.id, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN (
    SELECT id FROM category WHERE type = 'CONSUMER' ORDER BY id LIMIT 2
) c
WHERE u.login_id = 'consumer1'
  AND NOT EXISTS (
      SELECT 1 FROM user_pref_category upc
      WHERE upc.user_id = u.id AND upc.category_id = c.id
  )
LIMIT 2;

-- 스타일 선호 (스타일 중 첫 번째, 두 번째가 있다고 가정)
INSERT INTO user_pref_style (user_id, style_id, created_at, updated_at)
SELECT u.id, s.id, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN (
    SELECT id FROM style ORDER BY id LIMIT 2
) s
WHERE u.login_id = 'consumer1'
  AND NOT EXISTS (
      SELECT 1 FROM user_pref_style ups
      WHERE ups.user_id = u.id AND ups.style_id = s.id
  )
LIMIT 2;

-- 지역 선호 (지역 중 첫 번째가 있다고 가정)
INSERT INTO user_pref_region (user_id, region_id, created_at, updated_at)
SELECT u.id, r.id, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN (
    SELECT id FROM region ORDER BY id LIMIT 1
) r
WHERE u.login_id = 'consumer1'
  AND NOT EXISTS (
      SELECT 1 FROM user_pref_region upr
      WHERE upr.user_id = u.id AND upr.region_id = r.id
  )
LIMIT 1;

-- 편의사항 선호 (편의사항 중 첫 번째가 있다고 가정)
INSERT INTO user_pref_feature (user_id, feature_id, created_at, updated_at)
SELECT u.id, f.id, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN (
    SELECT id FROM feature ORDER BY id LIMIT 1
) f
WHERE u.login_id = 'consumer1'
  AND NOT EXISTS (
      SELECT 1 FROM user_pref_feature upf
      WHERE upf.user_id = u.id AND upf.feature_id = f.id
  )
LIMIT 1;

-- Seller 계정
INSERT INTO users (login_id, password, name, nickname, email, role, created_at, updated_at)
VALUES (
    'seller1',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '테스트 판매자',
    '판매자1',
    'seller1@test.com',
    'SELLER',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
)
ON CONFLICT (login_id) DO NOTHING;

-- Seller 프로필 추가
INSERT INTO seller_profile (user_id, activity_region, introduction, created_at, updated_at)
SELECT u.id, '광주/남구', '테스트 판매자 프로필입니다.', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM users u
WHERE u.login_id = 'seller1'
  AND NOT EXISTS (
      SELECT 1 FROM seller_profile sp WHERE sp.user_id = u.id
  );

-- Admin 계정
INSERT INTO users (login_id, password, name, nickname, email, role, created_at, updated_at)
VALUES (
    'admin1',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '관리자',
    '관리자1',
    'admin1@test.com',
    'ADMIN',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
)
ON CONFLICT (login_id) DO NOTHING;

