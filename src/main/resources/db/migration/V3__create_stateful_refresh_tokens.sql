-- Stateful Refresh Token 테이블 마이그레이션
-- 기존 refresh_tokens 테이블이 있다면 삭제하고 새로 생성

-- 기존 테이블 삭제 (주의: 기존 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS refresh_tokens;

-- Stateful Refresh Token 테이블 생성
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE COMMENT 'SHA-256 해시 (64자 hex)',
    issued_at TIMESTAMP NOT NULL COMMENT '발급 시각',
    expires_at TIMESTAMP NOT NULL COMMENT '만료 시각',
    revoked BOOLEAN NOT NULL DEFAULT FALSE COMMENT '무효화 여부',
    replaced_by VARCHAR(128) COMMENT '회전 시 새 토큰 해시',
    device_id VARCHAR(255) COMMENT '디바이스 식별자',
    user_agent VARCHAR(512) COMMENT 'User-Agent',
    ip VARCHAR(45) COMMENT 'IP 주소 (IPv6 지원)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE UNIQUE INDEX idx_rt_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_user_revoked ON refresh_tokens(user_id, revoked);
CREATE INDEX idx_rt_expires_at ON refresh_tokens(expires_at);

