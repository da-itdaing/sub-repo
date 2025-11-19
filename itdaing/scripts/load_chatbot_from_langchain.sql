-- ============================================================================
--  itdaing/scripts/load_chatbot_from_langchain.sql
--  --------------------------------------------------------------------------
--  Purpose  : Migrate data from langchain_pg_* tables (loaded via sample.sql)
--             into the unified chatbot_prompt / chatbot_prompt_embedding tables.
--  Usage    : psql -f itdaing/scripts/load_chatbot_from_langchain.sql <conn>
--  Remarks  :
--      * Requires langchain_pg_collection / langchain_pg_embedding to be present.
--      * Idempotent: existing prompt rows updated, embeddings replaced wholesale.
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'langchain_pg_collection'
    ) THEN
        RAISE NOTICE 'Skipping load: langchain_pg_collection table not found.';
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'langchain_pg_embedding'
    ) THEN
        RAISE NOTICE 'Skipping load: langchain_pg_embedding table not found.';
        RETURN;
    END IF;
END $$;

BEGIN;

CREATE TEMP TABLE tmp_chatbot_prompt_map (
    id BIGINT,
    prompt_key TEXT
) ON COMMIT DROP;

WITH src AS (
    SELECT
        uuid::text                                             AS prompt_id,
        name,
        cmetadata,
        CASE
            WHEN name ILIKE '%popup%' THEN 'popup'
            WHEN name ILIKE '%doc%'   THEN 'document'
            ELSE 'general'
        END                                                    AS fallback_category
    FROM langchain_pg_collection
),
upserted AS (
    INSERT INTO chatbot_prompt (prompt_id, title, source_context, category)
    SELECT
        s.prompt_id,
        NULLIF(initcap(replace(s.name, '_', ' ')), ''),
        COALESCE(
            NULLIF((s.cmetadata ->> 'source_context'), ''),
            NULLIF((s.cmetadata ->> 'source'), ''),
            'Imported from langchain_pg_collection:' || s.name
        ),
        COALESCE(NULLIF((s.cmetadata ->> 'category'), ''), s.fallback_category)
    FROM src s
    ON CONFLICT (prompt_id) DO UPDATE
        SET title          = EXCLUDED.title,
            source_context = EXCLUDED.source_context,
            category       = EXCLUDED.category,
            updated_at     = CURRENT_TIMESTAMP
    RETURNING id, prompt_id
)
INSERT INTO tmp_chatbot_prompt_map (id, prompt_key)
SELECT id, prompt_id
FROM upserted;

DELETE FROM chatbot_prompt_embedding e
USING tmp_chatbot_prompt_map t
WHERE e.prompt_id = t.id;

INSERT INTO chatbot_prompt_embedding (
    prompt_id,
    chunk_index,
    chunk_text,
    embedding,
    metadata
)
SELECT
    t.id,
    ROW_NUMBER() OVER (PARTITION BY le.collection_id ORDER BY le.id)::INTEGER AS chunk_index,
    COALESCE(NULLIF(le.document, ''), '(no content)')                           AS chunk_text,
    le.embedding,
    COALESCE(le.cmetadata, '{}'::jsonb)
FROM langchain_pg_embedding le
JOIN tmp_chatbot_prompt_map t ON t.prompt_key = le.collection_id::text
ORDER BY le.collection_id, chunk_index;

COMMIT;

