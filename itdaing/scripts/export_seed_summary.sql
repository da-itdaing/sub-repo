-- ============================================================================
--  itdaing/scripts/export_seed_summary.sql
--  --------------------------------------------------------------------------
--  Purpose : Aggregate seeded market dataset into a single JSON object covering
--            zones, cells, popups, sellers, consumers, and guardrail policies.
--  Usage   : psql -f itdaing/scripts/export_seed_summary.sql -t -A -o <file>
-- ============================================================================

WITH zone_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', z.id,
                'source_zone_id', (z.geometry_data::jsonb) ->> 'source_zone_id',
                'region', r.name,
                'name', z.name,
                'theme', (z.geometry_data::jsonb) ->> 'theme',
                'features', COALESCE((z.geometry_data::jsonb) -> 'features', '[]'::jsonb),
                'status', z.status,
                'max_capacity', z.max_capacity,
                'notice', z.notice
            ) ORDER BY z.id
        ),
        '[]'::jsonb
    ) AS data
    FROM zone_area z
    JOIN region r ON z.region_id = r.id
),
cell_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'zone_id', c.zone_area_id,
                'zone_name', za.name,
                'owner_login', u.login_id,
                'label', c.label,
                'address', c.detailed_address,
                'coordinates', jsonb_build_object('lat', c.lat, 'lng', c.lng),
                'status', c.status,
                'max_capacity', c.max_capacity,
                'notice', c.notice
            ) ORDER BY c.id
        ),
        '[]'::jsonb
    ) AS data
    FROM zone_cell c
    JOIN zone_area za ON c.zone_area_id = za.id
    LEFT JOIN users u ON c.owner_id = u.id
),
popup_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'seller_login', s.login_id,
                'zone_id', za.id,
                'zone_name', za.name,
                'cell_id', zc.id,
                'cell_label', zc.label,
                'name', p.name,
                'description', p.description,
                'start_date', p.start_date,
                'end_date', p.end_date,
                'operating_time', p.operating_time,
                'approval_status', p.approval_status,
                'view_count', p.view_count,
                'categories', (
                    SELECT COALESCE(jsonb_agg(cat.name ORDER BY cat.name), '[]'::jsonb)
                    FROM popup_category pc
                    JOIN category cat ON pc.category_id = cat.id
                    WHERE pc.popup_id = p.id
                ),
                'styles', (
                    SELECT COALESCE(jsonb_agg(st.name ORDER BY st.name), '[]'::jsonb)
                    FROM popup_style ps
                    JOIN style st ON ps.style_id = st.id
                    WHERE ps.popup_id = p.id
                ),
                'features', (
                    SELECT COALESCE(jsonb_agg(ft.name ORDER BY ft.name), '[]'::jsonb)
                    FROM popup_feature pf
                    JOIN feature ft ON pf.feature_id = ft.id
                    WHERE pf.popup_id = p.id
                )
            ) ORDER BY p.id
        ),
        '[]'::jsonb
    ) AS data
    FROM popup p
    JOIN zone_cell zc ON p.zone_cell_id = zc.id
    JOIN zone_area za ON zc.zone_area_id = za.id
    JOIN users s ON p.seller_id = s.id
),
seller_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'login_id', u.login_id,
                'name', u.name,
                'activity_region', sp.activity_region,
                'specialty', sp.category,
                'intro', sp.introduction
            ) ORDER BY u.login_id
        ),
        '[]'::jsonb
    ) AS data
    FROM users u
    LEFT JOIN seller_profile sp ON sp.user_id = u.id
    WHERE u.role = 'SELLER'
      AND u.login_id ~ '^seller([1-9]|[1-4][0-9]|5[0-5])$'
),
consumer_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'login_id', u.login_id,
                'name', u.name,
                'age_group', u.age_group,
                'mbti', u.mbti,
                'favorite_categories', (
                    SELECT COALESCE(jsonb_agg(cat.name ORDER BY cat.name), '[]'::jsonb)
                    FROM user_pref_category upc
                    JOIN category cat ON upc.category_id = cat.id
                    WHERE upc.user_id = u.id
                ),
                'favorite_styles', (
                    SELECT COALESCE(jsonb_agg(st.name ORDER BY st.name), '[]'::jsonb)
                    FROM user_pref_style ups
                    JOIN style st ON ups.style_id = st.id
                    WHERE ups.user_id = u.id
                )
            ) ORDER BY u.login_id
        ),
        '[]'::jsonb
    ) AS data
    FROM users u
    WHERE u.role = 'CONSUMER'
      AND u.login_id ~ '^consumer([1-9]|1[0-9]|2[0-5])$'
),
guardrail_json AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'service_area', service_area,
                'forbidden_keywords', forbidden_keywords,
                'disallowed_topics', disallowed_topics,
                'updated_at', updated_at
            ) ORDER BY service_area
        ),
        '[]'::jsonb
    ) AS data
    FROM guardrail_policy
)
SELECT jsonb_pretty(
    jsonb_build_object(
        'zones', zone_json.data,
        'cells', cell_json.data,
        'popups', popup_json.data,
        'sellers', seller_json.data,
        'consumers', consumer_json.data,
        'guardrails', guardrail_json.data
    )
)
FROM zone_json, cell_json, popup_json, seller_json, consumer_json, guardrail_json;

