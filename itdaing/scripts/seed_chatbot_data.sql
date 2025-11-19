-- ============================================================================
--  itdaing/scripts/seed_chatbot_data.sql
--  --------------------------------------------------------------------------
--  Purpose  : Provision chatbot prompt tables (pgvector backed) and guarantee
--             that seeded seller / consumer demo users have no missing fields.
--  Usage    : psql -f itdaing/scripts/seed_chatbot_data.sql <conn options>
--  Notes    :
--      * Statements are idempotent; safe to re-run.
--      * Requires PostgreSQL 15+ with the pgvector extension installed.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Chatbot prompt storage (pgvector)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chatbot_prompt (
    id              BIGSERIAL PRIMARY KEY,
    prompt_id       TEXT NOT NULL UNIQUE,
    title           TEXT,
    source_context  TEXT,
    category        TEXT,
    created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_prompt_embedding (
    id              BIGSERIAL PRIMARY KEY,
    prompt_id       BIGINT REFERENCES chatbot_prompt(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    chunk_text      TEXT NOT NULL,
    embedding       vector(1536) NOT NULL, -- OpenAI text-embedding-3-small dimensionality
    metadata        JSONB,
    created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompt_embedding_prompt
    ON chatbot_prompt_embedding(prompt_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompt_embedding_vector
    ON chatbot_prompt_embedding
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- Seller demo data completion
-- ---------------------------------------------------------------------------
WITH seller_fallbacks AS (
    SELECT
        u.id,
        u.login_id,
        COALESCE(NULLIF(u.name, ''), initcap(replace(u.login_id, '_', ' ')))                               AS name_fb,
        COALESCE(NULLIF(u.nickname, ''), '셀러 ' || initcap(replace(u.login_id, '_', ' ')))                 AS nickname_fb,
        COALESCE(NULLIF(u.email, ''), lower(u.login_id) || '@seller.seed.da-itdaing.com')                  AS email_fb,
        COALESCE(u.age_group, 30)                                                                          AS age_group_fb,
        COALESCE(NULLIF(u.mbti, ''), 'ENFJ')                                                               AS mbti_fb,
        COALESCE(NULLIF(u.profile_image_url, ''), 'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/seed/sellers/' || u.login_id || '.jpg') AS img_url_fb,
        COALESCE(NULLIF(u.profile_image_key, ''), 'seed/sellers/' || u.login_id || '.jpg')                 AS img_key_fb
    FROM users u
    WHERE u.role = 'SELLER'
),
updated_sellers AS (
    UPDATE users u
    SET name              = sf.name_fb,
        nickname          = sf.nickname_fb,
        email             = sf.email_fb,
        age_group         = sf.age_group_fb,
        mbti              = sf.mbti_fb,
        profile_image_url = sf.img_url_fb,
        profile_image_key = sf.img_key_fb
    FROM seller_fallbacks sf
    WHERE u.id = sf.id
      AND (
          u.name IS NULL OR u.name = '' OR
          u.nickname IS NULL OR u.nickname = '' OR
          u.email IS NULL OR u.email = '' OR
          u.age_group IS NULL OR
          u.mbti IS NULL OR u.mbti = '' OR
          u.profile_image_url IS NULL OR u.profile_image_url = '' OR
          u.profile_image_key IS NULL OR u.profile_image_key = ''
      )
    RETURNING u.id
),
inserted_seller_profiles AS (
    INSERT INTO seller_profile (
        user_id,
        profile_image_url,
        profile_image_key,
        introduction,
        activity_region,
        sns_url,
        category,
        contact_phone,
        created_at,
        updated_at
    )
    SELECT
        sf.id,
        sf.img_url_fb,
        sf.img_key_fb,
        '광주 지역 셀러 ' || initcap(replace(sf.login_id, '_', ' ')) || '의 스토리입니다.',
        '광주광역시',
        'https://instagram.com/' || sf.login_id,
        '라이프스타일',
        '010-0000-0000',
        NOW(),
        NOW()
    FROM seller_fallbacks sf
    WHERE NOT EXISTS (
        SELECT 1
        FROM seller_profile sp
        WHERE sp.user_id = sf.id
    )
    RETURNING user_id
)
UPDATE seller_profile sp
SET introduction       = COALESCE(NULLIF(sp.introduction, ''), '광주 지역 셀러 ' || initcap(replace(u.login_id, '_', ' ')) || '의 스토리입니다.'),
    activity_region    = COALESCE(NULLIF(sp.activity_region, ''), '광주광역시'),
    sns_url            = COALESCE(NULLIF(sp.sns_url, ''), 'https://instagram.com/' || u.login_id),
    category           = COALESCE(NULLIF(sp.category, ''), '라이프스타일'),
    contact_phone      = COALESCE(NULLIF(sp.contact_phone, ''), '010-0000-0000'),
    profile_image_url  = COALESCE(NULLIF(sp.profile_image_url, ''), 'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/seed/sellers/' || u.login_id || '.jpg'),
    profile_image_key  = COALESCE(NULLIF(sp.profile_image_key, ''), 'seed/sellers/' || u.login_id || '.jpg'),
    updated_at         = NOW()
FROM users u
WHERE sp.user_id = u.id
  AND u.role = 'SELLER';

-- ---------------------------------------------------------------------------
-- Consumer demo data completion
-- ---------------------------------------------------------------------------
WITH consumer_fallbacks AS (
    SELECT
        u.id,
        u.login_id,
        COALESCE(NULLIF(u.name, ''), initcap(replace(u.login_id, '_', ' ')))                               AS name_fb,
        COALESCE(NULLIF(u.nickname, ''), '소비자 ' || initcap(replace(u.login_id, '_', ' ')))               AS nickname_fb,
        COALESCE(NULLIF(u.email, ''), lower(u.login_id) || '@consumer.seed.da-itdaing.com')                AS email_fb,
        COALESCE(u.age_group, 30)                                                                          AS age_group_fb,
        COALESCE(NULLIF(u.mbti, ''), 'INFP')                                                               AS mbti_fb,
        COALESCE(NULLIF(u.profile_image_url, ''), 'https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/seed/consumers/' || u.login_id || '.jpg') AS img_url_fb,
        COALESCE(NULLIF(u.profile_image_key, ''), 'seed/consumers/' || u.login_id || '.jpg')               AS img_key_fb
    FROM users u
    WHERE u.role = 'CONSUMER'
),
updated_consumers AS (
    UPDATE users u
    SET name              = cf.name_fb,
        nickname          = cf.nickname_fb,
        email             = cf.email_fb,
        age_group         = cf.age_group_fb,
        mbti              = cf.mbti_fb,
        profile_image_url = cf.img_url_fb,
        profile_image_key = cf.img_key_fb
    FROM consumer_fallbacks cf
    WHERE u.id = cf.id
      AND (
          u.name IS NULL OR u.name = '' OR
          u.nickname IS NULL OR u.nickname = '' OR
          u.email IS NULL OR u.email = '' OR
          u.age_group IS NULL OR
          u.mbti IS NULL OR u.mbti = '' OR
          u.profile_image_url IS NULL OR u.profile_image_url = '' OR
          u.profile_image_key IS NULL OR u.profile_image_key = ''
      )
    RETURNING u.id
)
SELECT 1;

COMMIT;

