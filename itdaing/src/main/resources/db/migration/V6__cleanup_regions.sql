-- 지역 데이터 정리: 광주광역시 5개구만 남기고 나머지 삭제

DO $$
BEGIN
    INSERT INTO region (name, created_at, updated_at)
    VALUES 
        ('남구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
        ('동구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
        ('서구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
        ('북구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
        ('광산구', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
    ON CONFLICT (name) DO UPDATE
    SET updated_at = EXCLUDED.updated_at;
END $$;

-- 다른 지역 데이터는 외래키 참조가 없을 때만 정리
DELETE FROM region r
WHERE r.name NOT IN ('남구', '동구', '서구', '북구', '광산구')
  AND NOT EXISTS (SELECT 1 FROM zone_area za WHERE za.region_id = r.id)
  AND NOT EXISTS (SELECT 1 FROM user_pref_region upr WHERE upr.region_id = r.id);

