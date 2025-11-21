-- 목업 데이터 생성 (실제 활용 가능한 데이터)
-- Popup, Review 등 실제 활용 가능한 데이터 생성

-- 기본 이미지 URL (application-dev.yml의 defaults에서 가져옴)
-- 실제로는 S3에 업로드된 이미지 URL을 사용해야 함

-- Popup 데이터 생성 (승인된 팝업 10-15개)
-- 다양한 카테고리/스타일/지역 분포, 다양한 기간 설정

-- 팝업 1: 패션 팝업 (남구, 현재 진행 중)
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '트렌디 패션 팝업스토어',
    '최신 패션 트렌드를 만나보세요! 다양한 스타일의 의류와 액세서리를 판매합니다.',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days',
    '10:00-22:00',
    'APPROVED',
    150,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'A1' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '남구 팝업존')
LIMIT 1;

-- 팝업 1 이미지
INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/1f65f319fc66053cc771a9875a94d071a6555ce4.png',
    'uploads/1f65f319fc66053cc771a9875a94d071a6555ce4.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '트렌디 패션 팝업스토어'
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/34febaa073f4651d36f9e74724d6a847f7b4e87b.png',
    'uploads/34febaa073f4651d36f9e74724d6a847f7b4e87b.png',
    false,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '트렌디 패션 팝업스토어'
LIMIT 1;

-- 팝업 1 카테고리 (POPUP 타입)
INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '트렌디 패션 팝업스토어' AND c.name = '패션' AND c.type = 'POPUP'
LIMIT 1;

-- 팝업 1 스타일
INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '트렌디 패션 팝업스토어' AND s.name = '활기찬'
ON CONFLICT DO NOTHING;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '트렌디 패션 팝업스토어' AND s.name = '포토존'
ON CONFLICT DO NOTHING;

-- 팝업 1 특징
INSERT INTO popup_feature (popup_id, feature_id)
SELECT
    p.id,
    f.id
FROM popup p
CROSS JOIN feature f
WHERE p.name = '트렌디 패션 팝업스토어' AND f.name = '무료입장'
LIMIT 1;

-- 팝업 2: 뷰티 팝업 (동구, 예정)
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '뷰티 라운지 팝업',
    '프리미엄 뷰티 제품을 만나보세요. 메이크업 체험과 상담이 가능합니다.',
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '15 days',
    '11:00-20:00',
    'APPROVED',
    89,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'A1' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '동구 팝업존')
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/e6f688d20f3479754131b0ac7ec700810a7b1265.png',
    'uploads/e6f688d20f3479754131b0ac7ec700810a7b1265.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '뷰티 라운지 팝업'
LIMIT 1;

INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '뷰티 라운지 팝업' AND c.name = '뷰티' AND c.type = 'POPUP'
LIMIT 1;

INSERT INTO popup_feature (popup_id, feature_id)
SELECT
    p.id,
    f.id
FROM popup p
CROSS JOIN feature f
WHERE p.name = '뷰티 라운지 팝업' AND f.name = '체험가능'
LIMIT 1;

-- 팝업 3: 음식 팝업 (서구, 현재 진행 중)
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '맛있는 푸드 트럭',
    '다양한 푸드 트럭이 모인 푸드 페스티벌! 맛있는 음식을 즐기세요.',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '8 days',
    '12:00-21:00',
    'APPROVED',
    234,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'A1' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '서구 팝업존')
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/f052ae48a2f8e894c47126c94845d427b18c0f8f.png',
    'uploads/f052ae48a2f8e894c47126c94845d427b18c0f8f.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '맛있는 푸드 트럭'
LIMIT 1;

INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '맛있는 푸드 트럭' AND c.name = '음식' AND c.type = 'POPUP'
LIMIT 1;

INSERT INTO popup_feature (popup_id, feature_id)
SELECT
    p.id,
    f.id
FROM popup p
CROSS JOIN feature f
WHERE p.name = '맛있는 푸드 트럭' AND f.name = '무료입장'
LIMIT 1;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '맛있는 푸드 트럭' AND s.name = '친구와 함께'
ON CONFLICT DO NOTHING;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '맛있는 푸드 트럭' AND s.name = '야외'
ON CONFLICT DO NOTHING;

-- 팝업 4-10: 추가 팝업들 (다양한 카테고리와 지역)
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '아트 갤러리 팝업',
    '신진 작가들의 작품을 만나보세요. 다양한 미술 작품과 굿즈를 판매합니다.',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '20 days',
    '10:00-19:00',
    'APPROVED',
    67,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'A2' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '남구 팝업존')
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/fb64eb656194ae46b05b2960a9c89215cc09c3de.png',
    'uploads/fb64eb656194ae46b05b2960a9c89215cc09c3de.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '아트 갤러리 팝업'
LIMIT 1;

INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '아트 갤러리 팝업' AND c.name = '아트' AND c.type = 'POPUP'
LIMIT 1;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '아트 갤러리 팝업' AND s.name = '감성적인'
ON CONFLICT DO NOTHING;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '아트 갤러리 팝업' AND s.name = '실내'
ON CONFLICT DO NOTHING;

-- 추가 팝업들 (5-10개)
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '키즈 놀이터 팝업',
    '아이들을 위한 다양한 놀이와 체험 공간입니다. 안전하고 재미있는 활동을 제공합니다.',
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '25 days',
    '10:00-18:00',
    'APPROVED',
    112,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'B1' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '남구 팝업존')
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/34febaa073f4651d36f9e74724d6a847f7b4e87b.png',
    'uploads/34febaa073f4651d36f9e74724d6a847f7b4e87b.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '키즈 놀이터 팝업'
LIMIT 1;

INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '키즈 놀이터 팝업' AND c.name = '키즈' AND c.type = 'POPUP'
LIMIT 1;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '키즈 놀이터 팝업' AND s.name = '가족과 함께'
ON CONFLICT DO NOTHING;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '키즈 놀이터 팝업' AND s.name = '체험가능'
ON CONFLICT DO NOTHING;

INSERT INTO popup_feature (popup_id, feature_id)
SELECT
    p.id,
    f.id
FROM popup p
CROSS JOIN feature f
WHERE p.name = '키즈 놀이터 팝업' AND f.name = '무료입장'
LIMIT 1;

-- 굿즈 팝업
INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
SELECT
    u.id,
    zc.id,
    '한정판 굿즈 샵',
    '다양한 한정판 굿즈와 수집품을 만나보세요. 특별한 기념품을 찾아보세요.',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '12 days',
    '11:00-20:00',
    'APPROVED',
    198,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
CROSS JOIN zone_cell zc
WHERE u.login_id = 'seller1' AND zc.label = 'A2' AND zc.zone_area_id IN (SELECT id FROM zone_area WHERE name = '동구 팝업존')
LIMIT 1;

INSERT INTO popup_image (popup_id, image_url, image_key, is_thumbnail, created_at)
SELECT
    p.id,
    'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/1f65f319fc66053cc771a9875a94d071a6555ce4.png',
    'uploads/1f65f319fc66053cc771a9875a94d071a6555ce4.png',
    true,
    CURRENT_TIMESTAMP(6)
FROM popup p
WHERE p.name = '한정판 굿즈 샵'
LIMIT 1;

INSERT INTO popup_category (popup_id, category_id, category_role)
SELECT
    p.id,
    c.id,
    'POPUP'
FROM popup p
CROSS JOIN category c
WHERE p.name = '한정판 굿즈 샵' AND c.name = '굿즈' AND c.type = 'POPUP'
LIMIT 1;

INSERT INTO popup_style (popup_id, style_id)
SELECT
    p.id,
    s.id
FROM popup p
CROSS JOIN style s
WHERE p.name = '한정판 굿즈 샵' AND s.name = '레트로/빈티지'
ON CONFLICT DO NOTHING;

INSERT INTO popup_feature (popup_id, feature_id)
SELECT
    p.id,
    f.id
FROM popup p
CROSS JOIN feature f
WHERE p.name = '한정판 굿즈 샵' AND f.name = '굿즈판매'
LIMIT 1;

-- 리뷰 데이터는 운영 DB 상황에 따라 이미 존재할 수 있으므로, Flyway 실패를 방지하기 위해
-- 별도의 시드 스크립트(또는 운영툴)에서 주입하도록 연기
