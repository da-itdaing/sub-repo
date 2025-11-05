-- 사용자 선호 테이블 생성

-- 사용자 선호 카테고리
CREATE TABLE IF NOT EXISTS user_pref_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_category UNIQUE (user_id, category_id),
    CONSTRAINT fk_user_pref_category_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_category_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- 사용자 선호 스타일
CREATE TABLE IF NOT EXISTS user_pref_style (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    style_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_style UNIQUE (user_id, style_id),
    CONSTRAINT fk_user_pref_style_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_style_style FOREIGN KEY (style_id) REFERENCES style(id) ON DELETE CASCADE
);

-- 사용자 선호 지역
CREATE TABLE IF NOT EXISTS user_pref_region (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    region_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_region UNIQUE (user_id, region_id),
    CONSTRAINT fk_user_pref_region_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_region_region FOREIGN KEY (region_id) REFERENCES region(id) ON DELETE CASCADE
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_user_pref_category_user ON user_pref_category(user_id);
CREATE INDEX idx_user_pref_style_user ON user_pref_style(user_id);
CREATE INDEX idx_user_pref_region_user ON user_pref_region(user_id);

