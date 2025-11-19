-- 인덱스 추가 (엔티티에 정의된 인덱스들을 데이터베이스에 반영)

-- PopupCategory 인덱스
CREATE INDEX IF NOT EXISTS idx_popup_category_popup ON popup_category(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_category_category ON popup_category(category_id);

-- PopupFeature 인덱스
CREATE INDEX IF NOT EXISTS idx_popup_feature_popup ON popup_feature(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_feature_feature ON popup_feature(feature_id);

-- PopupStyle 인덱스
CREATE INDEX IF NOT EXISTS idx_popup_style_popup ON popup_style(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_style_style ON popup_style(style_id);

-- Review 인덱스 (idx_review_sort는 이미 존재하므로 추가 인덱스만 생성)
CREATE INDEX IF NOT EXISTS idx_review_popup ON review(popup_id);
CREATE INDEX IF NOT EXISTS idx_review_consumer ON review(consumer_id);

