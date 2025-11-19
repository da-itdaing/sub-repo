-- ============================================================================
--  itdaing/scripts/seed_dashboard_data.sql
--  --------------------------------------------------------------------------
--  Purpose  : Seed relational data required by the consumer dashboard / mypage
--             features so that the frontend can display realistic content
--             using the live database instead of mock JSON.
--  Target   : PostgreSQL (tested on 16.x). Statements are idempotent.
--  Scope    :
--      * Populate preference tables for key demo consumers (consumer1~3)
--      * Register wishlist (favorites) relationships
--      * Insert daily consumer recommendations (with scores/reasons)
--      * Record recent VIEW / FAVORITE activity logs for analytics widgets
--  Notes    :
--      - All lookups are resolved by login_id or popup name to avoid depending
--        on hard-coded numeric IDs.
--      - Use ON CONFLICT / WHERE NOT EXISTS to keep the script repeatable.
--      - Coordinates are already centered on Gwangju; no additional geometry
--        data is mutated here.
--  Usage    :
--      psql -f itdaing/scripts/seed_dashboard_data.sql <connection options>
-- ============================================================================

BEGIN;

CREATE TEMP TABLE tmp_consumers AS
SELECT login_id, id
FROM users
WHERE login_id IN ('consumer1', 'consumer2', 'consumer3');

CREATE TEMP TABLE tmp_pickup_popups AS
SELECT id,
       ROW_NUMBER() OVER (ORDER BY id)                AS rn_asc,
       ROW_NUMBER() OVER (ORDER BY id DESC)           AS rn_desc,
       ROW_NUMBER() OVER (ORDER BY random())          AS rn_random,
       ROW_NUMBER() OVER (ORDER BY id) % 4            AS rn_group
FROM (
    SELECT p.id
    FROM popup p
    WHERE p.approval_status = 'APPROVED'
    ORDER BY p.view_count DESC, p.id
    LIMIT 24
) ranked;

-- ---------------------------------------------------------------------------
-- Consumer preferences (category / style / feature / region)
-- ---------------------------------------------------------------------------
INSERT INTO user_pref_category (user_id, category_id)
SELECT c.id, cat.id
FROM tmp_consumers c
JOIN category cat
  ON cat.name = ANY (ARRAY['패션', '문화', '라이프'])
WHERE c.login_id = 'consumer1'
ON CONFLICT ON CONSTRAINT uk_user_category DO NOTHING;

INSERT INTO user_pref_category (user_id, category_id)
SELECT c.id, cat.id
FROM tmp_consumers c
JOIN category cat
  ON cat.name = ANY (ARRAY['라이프', '푸드'])
WHERE c.login_id = 'consumer2'
ON CONFLICT ON CONSTRAINT uk_user_category DO NOTHING;

INSERT INTO user_pref_category (user_id, category_id)
SELECT c.id, cat.id
FROM tmp_consumers c
JOIN category cat
  ON cat.name = ANY (ARRAY['패션', '뷰티'])
WHERE c.login_id = 'consumer3'
ON CONFLICT ON CONSTRAINT uk_user_category DO NOTHING;

INSERT INTO user_pref_style (user_id, style_id)
SELECT c.id, st.id
FROM tmp_consumers c
JOIN style st
  ON st.name = ANY (ARRAY['모던', '미니멀', '빈티지'])
WHERE c.login_id = 'consumer1'
ON CONFLICT ON CONSTRAINT uk_user_style DO NOTHING;

INSERT INTO user_pref_style (user_id, style_id)
SELECT c.id, st.id
FROM tmp_consumers c
JOIN style st
  ON st.name = ANY (ARRAY['캐주얼', '럭셔리'])
WHERE c.login_id = 'consumer2'
ON CONFLICT ON CONSTRAINT uk_user_style DO NOTHING;

INSERT INTO user_pref_style (user_id, style_id)
SELECT c.id, st.id
FROM tmp_consumers c
JOIN style st
  ON st.name = ANY (ARRAY['모던', '캐주얼'])
WHERE c.login_id = 'consumer3'
ON CONFLICT ON CONSTRAINT uk_user_style DO NOTHING;

INSERT INTO user_pref_feature (user_id, feature_id)
SELECT c.id, f.id
FROM tmp_consumers c
JOIN feature f
  ON f.name = ANY (ARRAY['주차 가능', '화장실', 'Wi-Fi'])
WHERE c.login_id = 'consumer1'
ON CONFLICT ON CONSTRAINT uk_user_feature DO NOTHING;

INSERT INTO user_pref_feature (user_id, feature_id)
SELECT c.id, f.id
FROM tmp_consumers c
JOIN feature f
  ON f.name = ANY (ARRAY['반려동물 동반', 'Wi-Fi'])
WHERE c.login_id = 'consumer2'
ON CONFLICT ON CONSTRAINT uk_user_feature DO NOTHING;

INSERT INTO user_pref_region (user_id, region_id)
SELECT c.id, r.id
FROM tmp_consumers c
JOIN region r
  ON r.name = ANY (ARRAY['광주'])
WHERE c.login_id IN ('consumer1', 'consumer2', 'consumer3')
ON CONFLICT ON CONSTRAINT uk_user_region DO NOTHING;

-- ---------------------------------------------------------------------------
-- Wishlist (favorites) entries tied to curated popups
-- ---------------------------------------------------------------------------
INSERT INTO wishlist (user_id, popup_id)
SELECT c.id, p.id
FROM tmp_consumers c
CROSS JOIN (
    SELECT id FROM tmp_pickup_popups ORDER BY rn_asc LIMIT 8
) p
WHERE c.login_id = 'consumer1'
ON CONFLICT ON CONSTRAINT uk_wishlist DO NOTHING;

INSERT INTO wishlist (user_id, popup_id)
SELECT c.id, p.id
FROM tmp_consumers c
CROSS JOIN (
    SELECT id
    FROM tmp_pickup_popups
    ORDER BY rn_desc
    LIMIT 4
) p
WHERE c.login_id = 'consumer2'
ON CONFLICT ON CONSTRAINT uk_wishlist DO NOTHING;

INSERT INTO wishlist (user_id, popup_id)
SELECT c.id, p.id
FROM tmp_consumers c
CROSS JOIN (
    SELECT id
    FROM tmp_pickup_popups
    ORDER BY rn_asc
    OFFSET 4
    LIMIT 4
) p
WHERE c.login_id = 'consumer3'
ON CONFLICT ON CONSTRAINT uk_wishlist DO NOTHING;

-- ---------------------------------------------------------------------------
-- Daily recommendations (score 0.7~0.95, reason payload as JSON string)
-- ---------------------------------------------------------------------------
WITH candidate_popups AS (
    SELECT ROW_NUMBER() OVER (ORDER BY id) AS idx, id
    FROM (
        SELECT id
        FROM tmp_pickup_popups
        ORDER BY rn_asc
        LIMIT 12
    ) ordered
)
INSERT INTO daily_consumer_recommendation
    (consumer_id, popup_id, recommendation_date, score, model_version, reason_json)
SELECT c.id,
       cp.id,
       CURRENT_DATE,
       CASE WHEN cp.idx <= 2 THEN 0.95
            WHEN cp.idx <= 4 THEN 0.88
            WHEN cp.idx <= 6 THEN 0.82
            ELSE 0.78 END AS score,
       'demo-gwangju-2025-11-18',
       json_build_object(
           'matchReasons',
           ARRAY[
               json_build_object('type','category','label','취향 카테고리 일치'),
               json_build_object('type','region','label','광주 인근 추천')
           ]
       )::text
FROM tmp_consumers c
JOIN candidate_popups cp ON TRUE
WHERE c.login_id IN ('consumer1', 'consumer2')
ON CONFLICT ON CONSTRAINT uk_dcr_dedup DO NOTHING;

-- ---------------------------------------------------------------------------
-- Recent activity logs for analytics (VIEW / FAVORITE actions)
-- ---------------------------------------------------------------------------
WITH events AS (
    SELECT 'consumer1'::varchar AS login_id, p.id AS popup_id, 'VIEW'::varchar AS action_type,
           timestamp '2025-11-17 10:05:00' AS created_at
    FROM tmp_pickup_popups p WHERE p.rn_asc = 1
    UNION ALL
    SELECT 'consumer1', p.id, 'VIEW', timestamp '2025-11-17 10:15:00'
    FROM tmp_pickup_popups p WHERE p.rn_desc = 1
    UNION ALL
    SELECT 'consumer1', p.id, 'FAVORITE', timestamp '2025-11-17 11:00:00'
    FROM tmp_pickup_popups p WHERE p.rn_asc = 1
    UNION ALL
    SELECT 'consumer2', p.id, 'VIEW', timestamp '2025-11-17 12:30:00'
    FROM tmp_pickup_popups p WHERE p.rn_asc = 3
    UNION ALL
    SELECT 'consumer3', p.id, 'VIEW', timestamp '2025-11-17 13:10:00'
    FROM tmp_pickup_popups p WHERE p.rn_asc = 5
)
INSERT INTO event_log (user_id, popup_id, action_type, created_at)
SELECT c.id, e.popup_id, e.action_type, e.created_at
FROM events e
JOIN tmp_consumers c ON c.login_id = e.login_id
WHERE NOT EXISTS (
    SELECT 1 FROM event_log existing
    WHERE existing.user_id = c.id
      AND existing.popup_id = e.popup_id
      AND existing.action_type = e.action_type
      AND existing.created_at = e.created_at
);

COMMIT;

-- ============================================================================
-- End of script
-- ============================================================================

