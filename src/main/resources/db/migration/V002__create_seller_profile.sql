-- 판매자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS seller_profile (
    user_id BIGINT PRIMARY KEY,
    profile_image_url VARCHAR(512),
    introduction VARCHAR(1000),
    activity_region VARCHAR(255) NOT NULL,
    sns_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_seller_profile_activity_region ON seller_profile(activity_region);

