-- zone_cell 에서 lat / lng 제거하고 geometry_data 추가
ALTER TABLE zone_cell
    DROP COLUMN IF EXISTS lat,
    DROP COLUMN IF EXISTS lng;

ALTER TABLE zone_cell
    ADD COLUMN IF NOT EXISTS geometry_data TEXT;