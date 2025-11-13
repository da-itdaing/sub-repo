-- ============================================
-- Itdaing (잇다잉) - 광주광역시 플리마켓 매칭 서비스
-- 전체 초기 데이터 삽입 스크립트
-- ============================================
-- BCrypt 해시: pass!1234 -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 실행 방법: psql -h [HOST] -U [USER] -d [DB] -f init-all-data.sql

-- ============================================
-- 1. 마스터 데이터 (카테고리, 스타일, 지역, 편의시설)
-- ============================================

-- 카테고리 데이터
INSERT INTO category (name, type, created_at, updated_at)
VALUES 
    ('패션', 'POPUP', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('푸드', 'POPUP', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('라이프', 'POPUP', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('뷰티', 'POPUP', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('문화', 'POPUP', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON CONFLICT (type, name) DO NOTHING;

-- 스타일 데이터
INSERT INTO style (name, created_at, updated_at)
VALUES 
    ('모던', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('빈티지', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('미니멀', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('캐주얼', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('럭셔리', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON CONFLICT (name) DO NOTHING;

-- 지역 데이터 (광주광역시 중심)
INSERT INTO region (name, created_at, updated_at)
VALUES 
    ('서울', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('부산', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('대구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('인천', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('광주', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON CONFLICT (name) DO NOTHING;

-- 편의시설 데이터
INSERT INTO feature (name, created_at, updated_at)
VALUES 
    ('주차 가능', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('화장실', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('Wi-Fi', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('반려동물 동반', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('휠체어 접근', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. 사용자 계정 생성
-- ============================================

-- 관리자 계정 (admin1 ~ admin5, 총 5명)
INSERT INTO users (login_id, password, name, nickname, email, role, created_at, updated_at)
VALUES 
    ('admin1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자1', 'admin1', 'admin1@itdaing.com', 'ADMIN', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('admin2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자2', 'admin2', 'admin2@itdaing.com', 'ADMIN', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('admin3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자3', 'admin3', 'admin3@itdaing.com', 'ADMIN', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('admin4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자4', 'admin4', 'admin4@itdaing.com', 'ADMIN', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('admin5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자5', 'admin5', 'admin5@itdaing.com', 'ADMIN', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON CONFLICT (login_id) DO NOTHING;

-- 판매자 계정 (seller1 ~ seller15, 총 15명)
INSERT INTO users (login_id, password, name, nickname, email, role, created_at, updated_at)
SELECT 
    'seller' || generate_series(1, 15),
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '판매자' || generate_series(1, 15),
    'seller' || generate_series(1, 15),
    'seller' || generate_series(1, 15) || '@itdaing.com',
    'SELLER',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
ON CONFLICT (login_id) DO NOTHING;

-- 판매자 프로필 추가
INSERT INTO seller_profile (user_id, profile_image_url, introduction, activity_region, created_at, updated_at)
SELECT 
    u.id,
    NULL,
    '광주 지역에서 플리마켓을 운영하고 있습니다.',
    CASE 
        WHEN u.login_id LIKE 'seller%' THEN 
            (ARRAY['광주 동구', '광주 서구', '광주 남구', '광주 북구', '광주 광산구'])[
                (CAST(SUBSTRING(u.login_id FROM 'seller(\d+)') AS INT) % 5) + 1
            ]
        ELSE '광주'
    END,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM users u
WHERE u.role = 'SELLER' AND u.login_id LIKE 'seller%'
ON CONFLICT (user_id) DO NOTHING;

-- 소비자 계정 (consumer1 ~ consumer50, 총 50명)
INSERT INTO users (login_id, password, name, nickname, email, age_group, mbti, role, created_at, updated_at)
SELECT 
    'consumer' || generate_series(1, 50),
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '소비자' || generate_series(1, 50),
    'user' || generate_series(1, 50),
    'consumer' || generate_series(1, 50) || '@itdaing.com',
    (ARRAY[20, 30, 40])[floor(random() * 3 + 1)],
    (ARRAY['INFP', 'ENFP', 'ISFP', 'ESFP', 'INTJ', 'ENTJ', 'ISFJ', 'ESFJ'])[floor(random() * 8 + 1)],
    'CONSUMER',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
ON CONFLICT (login_id) DO NOTHING;

-- ============================================
-- 3. ZoneArea 생성 (광주광역시 5개 구별, 총 25개)
-- ============================================

-- 동구 (5개)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 5, name, geometry_data, 'AVAILABLE', max_capacity, notice, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM (VALUES
    ('광주 동구 무등산 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9200,35.1440],[126.9300,35.1440],[126.9300,35.1480],[126.9200,35.1480],[126.9200,35.1440]]]}', 100, '무등산 인근 플리마켓 운영 구역입니다.'),
    ('광주 동구 충장로 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9150,35.1450],[126.9250,35.1450],[126.9250,35.1490],[126.9150,35.1490],[126.9150,35.1450]]]}', 90, '충장로 중심가 플리마켓 구역입니다.'),
    ('광주 동구 문화전당 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9100,35.1420],[126.9200,35.1420],[126.9200,35.1460],[126.9100,35.1460],[126.9100,35.1420]]]}', 85, '문화전당 인근 플리마켓 구역입니다.'),
    ('광주 동구 대인시장 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9050,35.1400],[126.9150,35.1400],[126.9150,35.1440],[126.9050,35.1440],[126.9050,35.1400]]]}', 95, '대인시장 인근 플리마켓 구역입니다.'),
    ('광주 동구 금남로 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9000,35.1380],[126.9100,35.1380],[126.9100,35.1420],[126.9000,35.1420],[126.9000,35.1380]]]}', 100, '금남로 상권 플리마켓 구역입니다.')
) AS v(name, geometry_data, max_capacity, notice)
WHERE EXISTS (SELECT 1 FROM region WHERE id = 5 AND name = '광주')
AND NOT EXISTS (SELECT 1 FROM zone_area WHERE zone_area.name = v.name);

-- 서구 (5개)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 5, name, geometry_data, 'AVAILABLE', max_capacity, notice, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM (VALUES
    ('광주 서구 첨단 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8850,35.1500],[126.8950,35.1500],[126.8950,35.1540],[126.8850,35.1540],[126.8850,35.1500]]]}', 120, '첨단지구 중심가 플리마켓 구역입니다.'),
    ('광주 서구 상무지구 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8800,35.1520],[126.8900,35.1520],[126.8900,35.1560],[126.8800,35.1560],[126.8800,35.1520]]]}', 110, '상무지구 중심가 플리마켓 구역입니다.'),
    ('광주 서구 풍암지구 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8750,35.1480],[126.8850,35.1480],[126.8850,35.1520],[126.8750,35.1520],[126.8750,35.1480]]]}', 105, '풍암지구 신도시 플리마켓 구역입니다.'),
    ('광주 서구 화정동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8700,35.1440],[126.8800,35.1440],[126.8800,35.1480],[126.8700,35.1480],[126.8700,35.1440]]]}', 88, '화정동 주거지역 플리마켓 구역입니다.'),
    ('광주 서구 치평동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8650,35.1400],[126.8750,35.1400],[126.8750,35.1440],[126.8650,35.1440],[126.8650,35.1400]]]}', 92, '치평동 상권 플리마켓 구역입니다.')
) AS v(name, geometry_data, max_capacity, notice)
WHERE EXISTS (SELECT 1 FROM region WHERE id = 5 AND name = '광주')
AND NOT EXISTS (SELECT 1 FROM zone_area WHERE zone_area.name = v.name);

-- 남구 (5개)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 5, name, geometry_data, 'AVAILABLE', max_capacity, notice, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM (VALUES
    ('광주 남구 양림동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9050,35.1360],[126.9150,35.1360],[126.9150,35.1400],[126.9050,35.1400],[126.9050,35.1360]]]}', 80, '양림동 역사문화 거리 플리마켓 구역입니다.'),
    ('광주 남구 봉선동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9000,35.1320],[126.9100,35.1320],[126.9100,35.1360],[126.9000,35.1360],[126.9000,35.1320]]]}', 87, '봉선동 주거지역 플리마켓 구역입니다.'),
    ('광주 남구 주월동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8950,35.1280],[126.9050,35.1280],[126.9050,35.1320],[126.8950,35.1320],[126.8950,35.1280]]]}', 83, '주월동 상권 플리마켓 구역입니다.'),
    ('광주 남구 진월동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8900,35.1240],[126.9000,35.1240],[126.9000,35.1280],[126.8900,35.1280],[126.8900,35.1240]]]}', 89, '진월동 문화거리 플리마켓 구역입니다.'),
    ('광주 남구 송하동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8850,35.1200],[126.8950,35.1200],[126.8950,35.1240],[126.8850,35.1240],[126.8850,35.1200]]]}', 86, '송하동 주거지역 플리마켓 구역입니다.')
) AS v(name, geometry_data, max_capacity, notice)
WHERE EXISTS (SELECT 1 FROM region WHERE id = 5 AND name = '광주')
AND NOT EXISTS (SELECT 1 FROM zone_area WHERE zone_area.name = v.name);

-- 북구 (5개)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 5, name, geometry_data, 'AVAILABLE', max_capacity, notice, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM (VALUES
    ('광주 북구 용봉동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8950,35.1720],[126.9050,35.1720],[126.9050,35.1760],[126.8950,35.1760],[126.8950,35.1720]]]}', 90, '용봉동 대학가 인근 플리마켓 구역입니다.'),
    ('광주 북구 문흥동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.9000,35.1780],[126.9100,35.1780],[126.9100,35.1820],[126.9000,35.1820],[126.9000,35.1780]]]}', 94, '문흥동 대학가 플리마켓 구역입니다.'),
    ('광주 북구 일곡동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8950,35.1740],[126.9050,35.1740],[126.9050,35.1780],[126.8950,35.1780],[126.8950,35.1740]]]}', 96, '일곡동 상권 플리마켓 구역입니다.'),
    ('광주 북구 오룡동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8900,35.1700],[126.9000,35.1700],[126.9000,35.1740],[126.8900,35.1740],[126.8900,35.1700]]]}', 91, '오룡동 주거지역 플리마켓 구역입니다.'),
    ('광주 북구 신안동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8850,35.1660],[126.8950,35.1660],[126.8950,35.1700],[126.8850,35.1700],[126.8850,35.1660]]]}', 93, '신안동 문화거리 플리마켓 구역입니다.')
) AS v(name, geometry_data, max_capacity, notice)
WHERE EXISTS (SELECT 1 FROM region WHERE id = 5 AND name = '광주')
AND NOT EXISTS (SELECT 1 FROM zone_area WHERE zone_area.name = v.name);

-- 광산구 (5개)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 5, name, geometry_data, 'AVAILABLE', max_capacity, notice, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM (VALUES
    ('광주 광산구 수완지구 플리마켓존', '{"type":"Polygon","coordinates":[[[126.7850,35.1380],[126.7950,35.1380],[126.7950,35.1420],[126.7850,35.1420],[126.7850,35.1380]]]}', 110, '수완지구 신도시 플리마켓 구역입니다.'),
    ('광주 광산구 하남동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.8000,35.1440],[126.8100,35.1440],[126.8100,35.1480],[126.8000,35.1480],[126.8000,35.1440]]]}', 97, '하남동 신도시 플리마켓 구역입니다.'),
    ('광주 광산구 신가동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.7950,35.1400],[126.8050,35.1400],[126.8050,35.1440],[126.7950,35.1440],[126.7950,35.1400]]]}', 99, '신가동 상권 플리마켓 구역입니다.'),
    ('광주 광산구 운남동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.7900,35.1360],[126.8000,35.1360],[126.8000,35.1400],[126.7900,35.1400],[126.7900,35.1360]]]}', 98, '운남동 주거지역 플리마켓 구역입니다.'),
    ('광주 광산구 월곡동 플리마켓존', '{"type":"Polygon","coordinates":[[[126.7850,35.1320],[126.7950,35.1320],[126.7950,35.1360],[126.7850,35.1360],[126.7850,35.1320]]]}', 101, '월곡동 문화거리 플리마켓 구역입니다.')
) AS v(name, geometry_data, max_capacity, notice)
WHERE EXISTS (SELECT 1 FROM region WHERE id = 5 AND name = '광주')
AND NOT EXISTS (SELECT 1 FROM zone_area WHERE zone_area.name = v.name);

-- ============================================
-- 4. ZoneCell 생성 (각 Area당 5개씩, 총 125개)
-- ============================================
DO $$
DECLARE
    area_rec RECORD;
    seller_rec RECORD;
    cell_labels TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E'];
    i INT;
    seller_offset INT;
BEGIN
    FOR area_rec IN SELECT id, name FROM zone_area ORDER BY id LOOP
        -- 각 Area당 5개 셀 생성
        FOR i IN 1..5 LOOP
            -- 판매자 순환 할당
            seller_offset := ((area_rec.id - 1) * 5 + i - 1) % (SELECT COUNT(*) FROM users WHERE role = 'SELLER');
            SELECT id INTO seller_rec.id
            FROM users
            WHERE role = 'SELLER'
            ORDER BY id
            OFFSET seller_offset
            LIMIT 1;
            
            IF seller_rec.id IS NOT NULL THEN
                INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
                VALUES (
                    area_rec.id,
                    seller_rec.id,
                    cell_labels[((i - 1) % array_length(cell_labels, 1)) + 1] || '-' || i,
                    area_rec.name || ' ' || cell_labels[((i - 1) % array_length(cell_labels, 1)) + 1] || '-' || i || ' 셀',
                    35.1200 + (area_rec.id * 0.002) + (i * 0.0005),
                    126.7800 + (area_rec.id * 0.005) + (i * 0.001),
                    CASE WHEN random() < 0.7 THEN 'APPROVED' ELSE 'PENDING' END,
                    10 + floor(random() * 15)::INT,
                    area_rec.name || ' ' || cell_labels[((i - 1) % array_length(cell_labels, 1)) + 1] || '-' || i || ' 셀',
                    CURRENT_TIMESTAMP(6),
                    CURRENT_TIMESTAMP(6)
                )
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 5. Popup 생성 (각 판매자당 8-12개, 총 150개 이상)
-- ============================================
DO $$
DECLARE
    seller_rec RECORD;
    cell_id_val BIGINT;
    popup_names TEXT[] := ARRAY[
        '힐링 플리마켓', '자연 친화 플리마켓', '테크 플리마켓', '라이프스타일 마켓',
        '빈티지 마켓', '수제품 마켓', '대학가 플리마켓', '패션 플리마켓',
        '신도시 플리마켓', '라이프 마켓', '커뮤니티 플리마켓', '핸드메이드 마켓',
        '지역 상생 플리마켓', '문화 예술 플리마켓', '푸드 플리마켓', '뷰티 플리마켓',
        '봄 플리마켓', '여름 플리마켓', '가을 플리마켓', '겨울 플리마켓'
    ];
    popup_name TEXT;
    statuses TEXT[] := ARRAY['APPROVED', 'PENDING', 'REJECTED'];
    status TEXT;
    i INT;
    j INT;
    days_offset INT;
    popup_id_val BIGINT;
BEGIN
    FOR seller_rec IN SELECT id, login_id FROM users WHERE role = 'SELLER' ORDER BY id LOOP
        FOR i IN 1..(8 + floor(random() * 5)::INT) LOOP
            -- 셀 선택 (판매자 소유 셀 우선, 없으면 승인된 셀)
            SELECT zc.id INTO cell_id_val
            FROM zone_cell zc
            WHERE zc.owner_id = seller_rec.id OR zc.status = 'APPROVED'
            ORDER BY CASE WHEN zc.owner_id = seller_rec.id THEN 1 ELSE 2 END, random()
            LIMIT 1;
            
            IF cell_id_val IS NOT NULL THEN
                popup_name := popup_names[1 + floor(random() * array_length(popup_names, 1))::INT] || ' ' || seller_rec.login_id || '-' || i || '-' || floor(random() * 1000)::INT;
                status := statuses[1 + floor(random() * array_length(statuses, 1))::INT];
                days_offset := floor(random() * 30)::INT - 10;
                
                INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)
                VALUES (
                    seller_rec.id,
                    cell_id_val,
                    popup_name,
                    popup_name || '입니다. 광주광역시에서 열리는 플리마켓입니다.',
                    CURRENT_DATE + (days_offset || ' days')::INTERVAL,
                    CURRENT_DATE + ((days_offset + 20 + floor(random() * 20)::INT) || ' days')::INTERVAL,
                    (9 + floor(random() * 3)::INT)::TEXT || ':00 - ' || (17 + floor(random() * 4)::INT)::TEXT || ':00',
                    status,
                    floor(random() * 300)::BIGINT,
                    CURRENT_TIMESTAMP(6),
                    CURRENT_TIMESTAMP(6)
                )
                RETURNING id INTO popup_id_val;
                
                -- 팝업 이미지 추가 (각 팝업당 1-3개)
                FOR j IN 1..(1 + floor(random() * 3)::INT) LOOP
                    INSERT INTO popup_image (popup_id, image_url, is_thumbnail, created_at)
                    VALUES (
                        popup_id_val,
                        'https://via.placeholder.com/800x600/' || 
                        (ARRAY['FF6B6B', '4ECDC4', '95E1D3', 'F38181', 'AA96DA', 'FCBAD3'])[1 + floor(random() * 6)::INT] ||
                        '/FFFFFF?text=' || REPLACE(popup_name, ' ', '+'),
                        j = 1,
                        CURRENT_TIMESTAMP(6)
                    );
                END LOOP;
                
                -- 팝업 카테고리 추가 (각 팝업당 1-2개)
                INSERT INTO popup_category (popup_id, category_id, category_role)
                SELECT popup_id_val, c.id, 'POPUP'
                FROM category c
                WHERE c.name IN ('패션', '푸드', '라이프', '뷰티', '문화')
                ORDER BY random()
                LIMIT (1 + floor(random() * 2)::INT)
                ON CONFLICT DO NOTHING;
                
                -- 팝업 스타일 추가 (각 팝업당 1-2개)
                INSERT INTO popup_style (popup_id, style_id)
                SELECT popup_id_val, s.id
                FROM style s
                WHERE s.name IN ('모던', '빈티지', '미니멀', '캐주얼', '럭셔리')
                ORDER BY random()
                LIMIT (1 + floor(random() * 2)::INT)
                ON CONFLICT DO NOTHING;
                
                -- 팝업 편의시설 추가 (각 팝업당 1-3개)
                INSERT INTO popup_feature (popup_id, feature_id)
                SELECT popup_id_val, f.id
                FROM feature f
                WHERE f.name IN ('주차 가능', '화장실', 'Wi-Fi', '반려동물 동반', '휠체어 접근')
                ORDER BY random()
                LIMIT (1 + floor(random() * 3)::INT)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 확인 쿼리
-- ============================================
SELECT 'Total Users:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Admin Users:', COUNT(*) FROM users WHERE role = 'ADMIN'
UNION ALL
SELECT 'Seller Users:', COUNT(*) FROM users WHERE role = 'SELLER'
UNION ALL
SELECT 'Consumer Users:', COUNT(*) FROM users WHERE role = 'CONSUMER'
UNION ALL
SELECT 'Categories:', COUNT(*) FROM category
UNION ALL
SELECT 'Styles:', COUNT(*) FROM style
UNION ALL
SELECT 'Regions:', COUNT(*) FROM region
UNION ALL
SELECT 'Features:', COUNT(*) FROM feature
UNION ALL
SELECT 'ZoneArea created:', COUNT(*) FROM zone_area
UNION ALL
SELECT 'ZoneCell created:', COUNT(*) FROM zone_cell
UNION ALL
SELECT 'Popup created:', COUNT(*) FROM popup
UNION ALL
SELECT 'Popup APPROVED:', COUNT(*) FROM popup WHERE approval_status = 'APPROVED'
UNION ALL
SELECT 'Popup PENDING:', COUNT(*) FROM popup WHERE approval_status = 'PENDING'
UNION ALL
SELECT 'Popup REJECTED:', COUNT(*) FROM popup WHERE approval_status = 'REJECTED'
UNION ALL
SELECT 'PopupImage created:', COUNT(*) FROM popup_image
UNION ALL
SELECT 'PopupCategory created:', COUNT(*) FROM popup_category
UNION ALL
SELECT 'PopupStyle created:', COUNT(*) FROM popup_style
UNION ALL
SELECT 'PopupFeature created:', COUNT(*) FROM popup_feature;
