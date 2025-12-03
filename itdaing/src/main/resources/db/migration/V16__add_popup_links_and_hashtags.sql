-- 팝업에 홈페이지 / SNS / 해시태그 컬럼 추가
ALTER TABLE popup
    ADD COLUMN homepage_url varchar(500);

ALTER TABLE popup
    ADD COLUMN sns_url varchar(500);

ALTER TABLE popup
    ADD COLUMN hashtags varchar(500);