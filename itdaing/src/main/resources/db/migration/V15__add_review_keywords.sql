-- 리뷰 키워드용 테이블 생성
CREATE TABLE review_keyword (
    review_id BIGINT NOT NULL,
    keyword VARCHAR(50),

    CONSTRAINT fk_review_keyword_review
        FOREIGN KEY (review_id)
        REFERENCES review (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_review_keyword_review_id
    ON review_keyword (review_id); ㅂ