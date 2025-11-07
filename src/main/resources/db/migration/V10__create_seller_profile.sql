-- src/main/resources/db/migration/V10__create_seller_profile.sql
CREATE TABLE IF NOT EXISTS seller_profile (
                                              user_id BIGINT NOT NULL,
                                              profile_image_url VARCHAR(512),
    introduction VARCHAR(1000),
    activity_region VARCHAR(255),
    sns_url VARCHAR(512),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_seller_profile PRIMARY KEY (user_id),
    CONSTRAINT fk_seller_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
