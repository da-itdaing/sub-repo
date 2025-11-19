ALTER TABLE popup_image
    ADD COLUMN IF NOT EXISTS image_key VARCHAR(255);

ALTER TABLE review_image
    ADD COLUMN IF NOT EXISTS image_key VARCHAR(255);

ALTER TABLE seller_profile
    ADD COLUMN IF NOT EXISTS profile_image_key VARCHAR(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS profile_image_key VARCHAR(255);

