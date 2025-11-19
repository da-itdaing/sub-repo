-- Base tables
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    login_id      VARCHAR(100) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    name          VARCHAR(100),
    nickname      VARCHAR(100),
    email         VARCHAR(255) NOT NULL,
    age_group     INT,
    mbti          VARCHAR(20),
    role          VARCHAR(20) NOT NULL,
    created_at    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_users_login UNIQUE (login_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('CONSUMER', 'SELLER', 'ADMIN'))
);

CREATE INDEX idx_users_role ON users(role);

CREATE TABLE seller_profile (
    user_id            BIGINT PRIMARY KEY,
    profile_image_url  VARCHAR(500),
    introduction       VARCHAR(500),
    activity_region    VARCHAR(100),
    sns_url            VARCHAR(200),
    created_at         TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_seller_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    token_hash   VARCHAR(128) NOT NULL,
    issued_at    TIMESTAMP(6) NOT NULL,
    expires_at   TIMESTAMP(6) NOT NULL,
    revoked      BOOLEAN NOT NULL DEFAULT false,
    replaced_by  VARCHAR(128),
    device_id    VARCHAR(255),
    user_agent   VARCHAR(512),
    ip           VARCHAR(45),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_rt_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_user_revoked ON refresh_tokens(user_id, revoked);

-- Master tables
CREATE TABLE category (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_category_type_name UNIQUE (type, name),
    CONSTRAINT chk_category_type CHECK (type IN ('POPUP', 'CONSUMER'))
);

CREATE TABLE style (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_style_name UNIQUE (name)
);

CREATE TABLE region (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_region_name UNIQUE (name)
);

CREATE TABLE feature (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_feature_name UNIQUE (name)
);

-- Geo tables
CREATE TABLE zone_area (
    id             BIGSERIAL PRIMARY KEY,
    region_id      BIGINT NOT NULL,
    name           VARCHAR(100) NOT NULL,
    geometry_data  TEXT,
    status         VARCHAR(20) NOT NULL,
    max_capacity   INT,
    notice         VARCHAR(1000),
    created_at     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_zone_area_region FOREIGN KEY (region_id) REFERENCES region(id),
    CONSTRAINT chk_zone_area_status CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'HIDDEN'))
);

CREATE INDEX idx_zone_area_region ON zone_area(region_id);

CREATE TABLE zone_cell (
    id               BIGSERIAL PRIMARY KEY,
    zone_area_id     BIGINT NOT NULL,
    owner_id         BIGINT NOT NULL,
    label            VARCHAR(100),
    detailed_address VARCHAR(255),
    lat              DOUBLE PRECISION NOT NULL,
    lng              DOUBLE PRECISION NOT NULL,
    status           VARCHAR(20) NOT NULL,
    max_capacity     INT,
    notice           VARCHAR(1000),
    created_at       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_zone_cell_area  FOREIGN KEY (zone_area_id) REFERENCES zone_area(id),
    CONSTRAINT fk_zone_cell_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT chk_zone_cell_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'))
);

CREATE INDEX idx_zone_cell_area  ON zone_cell(zone_area_id);
CREATE INDEX idx_zone_cell_owner ON zone_cell(owner_id);

CREATE TABLE zone_availability (
    id                    BIGSERIAL PRIMARY KEY,
    zone_cell_id          BIGINT NOT NULL,
    start_date            DATE NOT NULL,
    end_date              DATE NOT NULL,
    daily_price           DECIMAL(14, 2) NOT NULL,
    max_concurrent_slots  INT NOT NULL DEFAULT 1,
    status                VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at            TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_zone_availability_cell FOREIGN KEY (zone_cell_id) REFERENCES zone_cell(id) ON DELETE CASCADE,
    CONSTRAINT chk_zone_availability_dates CHECK (start_date <= end_date)
);

CREATE INDEX idx_zone_avail_range ON zone_availability(zone_cell_id, start_date, end_date);

-- Popup tables
CREATE TABLE popup (
    id               BIGSERIAL PRIMARY KEY,
    seller_id        BIGINT NOT NULL,
    zone_cell_id     BIGINT NOT NULL,
    name             VARCHAR(200) NOT NULL,
    description      TEXT,
    start_date       DATE,
    end_date         DATE,
    operating_time   VARCHAR(50),
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    view_count       BIGINT NOT NULL DEFAULT 0,
    created_at       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_popup_seller    FOREIGN KEY (seller_id)    REFERENCES users(id),
    CONSTRAINT fk_popup_zone_cell FOREIGN KEY (zone_cell_id) REFERENCES zone_cell(id),
    CONSTRAINT chk_popup_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_popup_seller  ON popup(seller_id);
CREATE INDEX idx_popup_cell    ON popup(zone_cell_id);
CREATE INDEX idx_popup_status  ON popup(approval_status);
CREATE INDEX idx_popup_period  ON popup(start_date, end_date);

CREATE TABLE popup_image (
    id            BIGSERIAL PRIMARY KEY,
    popup_id      BIGINT NOT NULL,
    image_url     VARCHAR(500) NOT NULL,
    is_thumbnail  BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_popup_image_popup FOREIGN KEY (popup_id) REFERENCES popup(id) ON DELETE CASCADE
);

CREATE INDEX idx_popup_img_thumb ON popup_image(popup_id, is_thumbnail);

CREATE TABLE popup_category (
    id             BIGSERIAL PRIMARY KEY,
    popup_id       BIGINT NOT NULL,
    category_id    BIGINT NOT NULL,
    category_role  VARCHAR(20) NOT NULL,
    CONSTRAINT uk_popup_category UNIQUE (popup_id, category_id, category_role),
    CONSTRAINT fk_popup_category_popup    FOREIGN KEY (popup_id)    REFERENCES popup(id)    ON DELETE CASCADE,
    CONSTRAINT fk_popup_category_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    CONSTRAINT chk_popup_category_role CHECK (category_role IN ('POPUP', 'TARGET'))
);

CREATE TABLE popup_feature (
    id          BIGSERIAL PRIMARY KEY,
    popup_id    BIGINT NOT NULL,
    feature_id  BIGINT NOT NULL,
    CONSTRAINT uk_popup_feature UNIQUE (popup_id, feature_id),
    CONSTRAINT fk_popup_feature_popup   FOREIGN KEY (popup_id)   REFERENCES popup(id)   ON DELETE CASCADE,
    CONSTRAINT fk_popup_feature_feature FOREIGN KEY (feature_id) REFERENCES feature(id) ON DELETE CASCADE
);

CREATE TABLE popup_style (
    id        BIGSERIAL PRIMARY KEY,
    popup_id  BIGINT NOT NULL,
    style_id  BIGINT NOT NULL,
    CONSTRAINT uk_popup_style UNIQUE (popup_id, style_id),
    CONSTRAINT fk_popup_style_popup FOREIGN KEY (popup_id) REFERENCES popup(id) ON DELETE CASCADE,
    CONSTRAINT fk_popup_style_style FOREIGN KEY (style_id) REFERENCES style(id) ON DELETE CASCADE
);

-- User preference tables
CREATE TABLE user_pref_category (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_category UNIQUE (user_id, category_id),
    CONSTRAINT fk_user_pref_category_user     FOREIGN KEY (user_id)     REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_category_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE TABLE user_pref_style (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    style_id   BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_style UNIQUE (user_id, style_id),
    CONSTRAINT fk_user_pref_style_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_style_style FOREIGN KEY (style_id) REFERENCES style(id) ON DELETE CASCADE
);

CREATE TABLE user_pref_region (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    region_id  BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_region UNIQUE (user_id, region_id),
    CONSTRAINT fk_user_pref_region_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_region_region FOREIGN KEY (region_id) REFERENCES region(id) ON DELETE CASCADE
);

CREATE TABLE user_pref_feature (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    feature_id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_feature UNIQUE (user_id, feature_id),
    CONSTRAINT fk_user_pref_feature_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_user_pref_feature_feature FOREIGN KEY (feature_id) REFERENCES feature(id) ON DELETE CASCADE
);

-- Social tables
CREATE TABLE wishlist (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    popup_id    BIGINT NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_wishlist UNIQUE (user_id, popup_id),
    CONSTRAINT fk_wishlist_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_popup FOREIGN KEY (popup_id) REFERENCES popup(id) ON DELETE CASCADE
);

CREATE TABLE review (
    id           BIGSERIAL PRIMARY KEY,
    consumer_id  BIGINT NOT NULL,
    popup_id     BIGINT NOT NULL,
    rating       SMALLINT NOT NULL,
    content      VARCHAR(150),
    created_at   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_review_once UNIQUE (consumer_id, popup_id),
    CONSTRAINT fk_review_consumer FOREIGN KEY (consumer_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_review_popup    FOREIGN KEY (popup_id)    REFERENCES popup(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_sort ON review(popup_id, rating, created_at);

CREATE TABLE review_image (
    id         BIGSERIAL PRIMARY KEY,
    review_id  BIGINT NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_review_image_review FOREIGN KEY (review_id) REFERENCES review(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_img_review ON review_image(review_id);

-- Messaging tables
CREATE TABLE message_thread (
    id                BIGSERIAL PRIMARY KEY,
    seller_id         BIGINT NOT NULL,
    admin_id          BIGINT,
    subject           VARCHAR(200) NOT NULL,
    unread_for_seller INT NOT NULL DEFAULT 0,
    unread_for_admin  INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMP(6) NOT NULL,
    updated_at        TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_thread_seller FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT fk_thread_admin  FOREIGN KEY (admin_id)  REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_thread_seller ON message_thread(seller_id);
CREATE INDEX idx_thread_admin  ON message_thread(admin_id);

CREATE TABLE message (
    id                  BIGSERIAL PRIMARY KEY,
    thread_id           BIGINT NOT NULL,
    sender_id           BIGINT NOT NULL,
    receiver_id         BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    content             TEXT,
    sent_at             TIMESTAMP(6) NOT NULL,
    read_at             TIMESTAMP(6),
    sender_deleted_at   TIMESTAMP(6),
    receiver_deleted_at TIMESTAMP(6),
    CONSTRAINT fk_message_thread   FOREIGN KEY (thread_id)   REFERENCES message_thread(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender   FOREIGN KEY (sender_id)   REFERENCES users(id),
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE INDEX idx_msg_inbox  ON message(receiver_id, read_at);
CREATE INDEX idx_msg_thread ON message(thread_id, sent_at DESC);

CREATE TABLE message_attachment (
    id            BIGSERIAL PRIMARY KEY,
    message_id    BIGINT NOT NULL,
    file_url      VARCHAR(500) NOT NULL,
    mime_type     VARCHAR(100),
    file_key      VARCHAR(500),
    original_name VARCHAR(255),
    size_bytes    BIGINT,
    CONSTRAINT fk_msg_attachment_msg FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE CASCADE
);

-- Announcement
CREATE TABLE announcement (
    id         BIGSERIAL PRIMARY KEY,
    author_id  BIGINT NOT NULL,
    audience   VARCHAR(20) NOT NULL,
    popup_id   BIGINT,
    title      VARCHAR(200) NOT NULL,
    content    TEXT,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_announcement_popup  FOREIGN KEY (popup_id)  REFERENCES popup(id) ON DELETE SET NULL,
    CONSTRAINT chk_announcement_audience CHECK (audience IN ('ALL', 'SELLER', 'CONSUMER'))
);

CREATE INDEX idx_announce_scope ON announcement(audience, popup_id, created_at);

-- AI recommendation
CREATE TABLE daily_consumer_recommendation (
    id                   BIGSERIAL PRIMARY KEY,
    consumer_id          BIGINT NOT NULL,
    popup_id             BIGINT NOT NULL,
    recommendation_date  DATE NOT NULL,
    score                DECIMAL(6, 3) NOT NULL DEFAULT 0,
    model_version        VARCHAR(50),
    reason_json          TEXT,
    created_at           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_dcr_dedup UNIQUE (consumer_id, recommendation_date, popup_id),
    CONSTRAINT fk_dcr_consumer FOREIGN KEY (consumer_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_dcr_popup    FOREIGN KEY (popup_id)    REFERENCES popup(id) ON DELETE CASCADE
);

CREATE TABLE user_reco_dismissal (
    id           BIGSERIAL PRIMARY KEY,
    consumer_id  BIGINT NOT NULL,
    date         DATE NOT NULL,
    popup_id     BIGINT NOT NULL,
    dismissed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_reco_dismiss UNIQUE (consumer_id, date, popup_id),
    CONSTRAINT fk_reco_dismiss_consumer FOREIGN KEY (consumer_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_reco_dismiss_popup    FOREIGN KEY (popup_id)    REFERENCES popup(id) ON DELETE CASCADE
);

CREATE TABLE daily_seller_recommendation (
    id                   BIGSERIAL PRIMARY KEY,
    seller_id            BIGINT NOT NULL,
    zone_area_id         BIGINT NOT NULL,
    recommendation_date  DATE NOT NULL,
    score                DECIMAL(6, 3) NOT NULL DEFAULT 0,
    model_version        VARCHAR(50),
    reason_json          TEXT,
    created_at           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_dsr_dedup UNIQUE (seller_id, recommendation_date, zone_area_id),
    CONSTRAINT fk_dsr_seller   FOREIGN KEY (seller_id)   REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_dsr_zonearea FOREIGN KEY (zone_area_id) REFERENCES zone_area(id) ON DELETE CASCADE
);

-- Events & metrics
CREATE TABLE event_log (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT,
    popup_id     BIGINT,
    zone_cell_id BIGINT,
    action_type  VARCHAR(20) NOT NULL,
    created_at   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_event_log_user     FOREIGN KEY (user_id)      REFERENCES users(id)     ON DELETE SET NULL,
    CONSTRAINT fk_event_log_popup    FOREIGN KEY (popup_id)     REFERENCES popup(id)     ON DELETE SET NULL,
    CONSTRAINT fk_event_log_zonecell FOREIGN KEY (zone_cell_id) REFERENCES zone_cell(id) ON DELETE SET NULL,
    CONSTRAINT chk_event_log_action CHECK (action_type IN ('VIEW', 'FAVORITE', 'REVIEW', 'CLICK'))
);

CREATE INDEX idx_evt_popup_time ON event_log(popup_id, created_at);
CREATE INDEX idx_evt_zone_time  ON event_log(zone_cell_id, created_at);
CREATE INDEX idx_evt_user_time  ON event_log(user_id, created_at);

CREATE TABLE event_log_category (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    category_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_evt_cat_user     FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE SET NULL,
    CONSTRAINT fk_evt_cat_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    CONSTRAINT chk_evt_cat_action CHECK (action_type IN ('VIEW', 'FAVORITE', 'REVIEW', 'CLICK'))
);

CREATE INDEX idx_evt_cat_time ON event_log_category(category_id, created_at);

CREATE TABLE metric_daily_popup (
    id            BIGSERIAL PRIMARY KEY,
    popup_id      BIGINT NOT NULL,
    date          DATE NOT NULL,
    views         INT NOT NULL DEFAULT 0,
    unique_users  INT NOT NULL DEFAULT 0,
    favorites     INT NOT NULL DEFAULT 0,
    reviews       INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_mdp_popup_date UNIQUE (popup_id, date),
    CONSTRAINT fk_mdp_popup FOREIGN KEY (popup_id) REFERENCES popup(id) ON DELETE CASCADE
);

CREATE TABLE metric_daily_category (
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    date        DATE NOT NULL,
    clicks      INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_mdc_cat_date UNIQUE (category_id, date),
    CONSTRAINT fk_mdc_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- Approval audit
CREATE TABLE approval_record (
    id          BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,
    target_id   BIGINT NOT NULL,
    decision    VARCHAR(20) NOT NULL,
    reason      VARCHAR(1000),
    admin_id    BIGINT NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_approval_admin FOREIGN KEY (admin_id) REFERENCES users(id),
    CONSTRAINT chk_approval_target CHECK (target_type IN ('POPUP')),
    CONSTRAINT chk_approval_decision CHECK (decision IN ('APPROVE', 'REJECT'))
);

CREATE INDEX idx_approval_target ON approval_record(target_type, target_id, created_at);



-- updated_at 자동 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(6);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_profile_updated_at BEFORE UPDATE ON seller_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_updated_at BEFORE UPDATE ON style
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_updated_at BEFORE UPDATE ON region
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_updated_at BEFORE UPDATE ON feature
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_area_updated_at BEFORE UPDATE ON zone_area
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_cell_updated_at BEFORE UPDATE ON zone_cell
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_availability_updated_at BEFORE UPDATE ON zone_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_updated_at BEFORE UPDATE ON popup
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pref_category_updated_at BEFORE UPDATE ON user_pref_category
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pref_style_updated_at BEFORE UPDATE ON user_pref_style
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pref_region_updated_at BEFORE UPDATE ON user_pref_region
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pref_feature_updated_at BEFORE UPDATE ON user_pref_feature
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_consumer_recommendation_updated_at BEFORE UPDATE ON daily_consumer_recommendation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_seller_recommendation_updated_at BEFORE UPDATE ON daily_seller_recommendation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
