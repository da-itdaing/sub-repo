-- Add new columns to event_log table
-- For enhanced event tracking from dev/be

-- Add session_id for session tracking
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Add source for tracking event source (web, mobile, etc)
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_log_session_id ON event_log(session_id);
CREATE INDEX IF NOT EXISTS idx_event_log_source ON event_log(source);

-- Add comments
COMMENT ON COLUMN event_log.session_id IS '사용자 세션 ID (조회수 중복 방지용)';
COMMENT ON COLUMN event_log.source IS '이벤트 발생 소스 (web, mobile, app 등)';

