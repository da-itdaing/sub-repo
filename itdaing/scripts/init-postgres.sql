-- PostgreSQL 초기화 스크립트
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

