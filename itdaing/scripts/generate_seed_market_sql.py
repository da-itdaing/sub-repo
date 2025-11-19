#!/usr/bin/env python3
"""
Generate SQL seed script from itdaing_seed.json to populate core market data.
"""
from __future__ import annotations

import json
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

PASSWORD_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
SEED_TAG = "itdaing_json"
SEED_MARKER = f"[seed:{SEED_TAG}]"

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SEED_SOURCE = PROJECT_ROOT.parents[0] / "itdaing_seed.json"
OUTPUT_PATH = PROJECT_ROOT / "scripts" / "seed_market_from_json.sql"

if not SEED_SOURCE.exists():
    raise SystemExit(f"Seed source not found: {SEED_SOURCE}")

with SEED_SOURCE.open("r", encoding="utf-8") as fp:
    payload = json.load(fp)

category_map = {item["category_id"]: item["name"] for item in payload["categories"]}
style_map = {item["style_id"]: item["name"] for item in payload["styles"]}
feature_map = {item["feature_id"]: item["name"] for item in payload["features"]}
region_map = {item["region_id"]: item["name"] for item in payload["regions"]}

sellers = payload["sellers"]
consumers = payload["consumers"]
zones = payload["zones"]
popups = payload["popups"]
guardrails = payload["guardrails"]

seller_logins = {seller["login_id"] for seller in sellers}
consumer_logins = {consumer["login_id"] for consumer in consumers}
zone_names = sorted({zone["name"] for zone in zones})
zone_name_list = ", ".join(f"'{name.replace("'", "''")}'" for name in zone_names)

# Validation
for zone in zones:
    if zone["region_id"] not in region_map:
        raise ValueError(f"Unknown region_id {zone['region_id']} in zone {zone['zone_id']}")
    for cell in zone.get("cells", []):
        if cell.get("owner_login") and cell["owner_login"] not in seller_logins:
            raise ValueError(f"Unknown seller login {cell['owner_login']} in cell {cell['cell_id']}")

for popup in popups:
    if popup["seller_login"] not in seller_logins:
        raise ValueError(f"Unknown seller login {popup['seller_login']} in popup {popup['popup_id']}")
    if popup["zone_id"] not in {z["zone_id"] for z in zones}:
        raise ValueError(f"Unknown zone_id {popup['zone_id']} in popup {popup['popup_id']}")
    if popup["cell_id"] not in {cell["cell_id"] for zone in zones for cell in zone["cells"]}:
        raise ValueError(f"Unknown cell_id {popup['cell_id']} in popup {popup['popup_id']}")
    for cat in popup.get("categories", []):
        if cat not in category_map:
            raise ValueError(f"Unknown category {cat} in popup {popup['popup_id']}")
    for sty in popup.get("styles", []):
        if sty not in style_map:
            raise ValueError(f"Unknown style {sty} in popup {popup['popup_id']}")
    for feat in popup.get("features", []):
        if feat not in feature_map:
            raise ValueError(f"Unknown feature {feat} in popup {popup['popup_id']}")

for consumer in consumers:
    for cat in consumer.get("favorite_categories", []):
        if cat not in category_map:
            raise ValueError(f"Unknown category {cat} for consumer {consumer['login_id']}")
    for sty in consumer.get("favorite_styles", []):
        if sty not in style_map:
            raise ValueError(f"Unknown style {sty} for consumer {consumer['login_id']}")

region_coords = {
    "gwangju_dong": (35.1450, 126.9230),
    "gwangju_seo": (35.1540, 126.8780),
    "gwangju_nam": (35.1320, 126.9030),
    "gwangju_buk": (35.1720, 126.9050),
    "gwangju_gwangsan": (35.1380, 126.7930),
}

if set(region_coords) != set(region_map.keys()):
    missing_coords = set(region_map.keys()) - set(region_coords)
    if missing_coords:
        raise ValueError(f"Missing coordinate definitions for regions: {sorted(missing_coords)}")

zone_index_by_region = defaultdict(int)
cell_geo = {}

ZONE_LAT_STEP = 0.008
ZONE_LNG_STEP = 0.008
CELL_LAT_STEP = 0.0007
CELL_LNG_STEP = 0.0007

for zone in zones:
    region_id = zone["region_id"]
    zone_idx = zone_index_by_region[region_id]
    zone_index_by_region[region_id] += 1
    base_lat, base_lng = region_coords[region_id]
    zone_lat = base_lat + zone_idx * ZONE_LAT_STEP
    zone_lng = base_lng + zone_idx * ZONE_LNG_STEP
    for idx, cell in enumerate(zone["cells"]):
        lat = zone_lat + idx * CELL_LAT_STEP
        lng = zone_lng + idx * CELL_LNG_STEP
        cell_geo[cell["cell_id"]] = {
            "zone_id": zone["zone_id"],
            "zone_name": zone["name"],
            "label": cell["label"],
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "owner_login": cell.get("owner_login"),
            "status": cell.get("status", "APPROVED"),
            "max_capacity": cell.get("max_capacity") or 10,
            "notice": cell.get("notice", "")
        }

BASE_DATE = date(2025, 11, 8)

s3_images = [
    "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/34febaa073f4651d36f9e74724d6a847f7b4e87b.png",
    "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/fb64eb656194ae46b05b2960a9c89215cc09c3de.png",
    "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/f052ae48a2f8e894c47126c94845d427b18c0f8f.png",
    "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/e6f688d20f3479754131b0ac7ec700810a7b1265.png",
    "https://daitdaing-static-files.s3.ap-northeast-2.amazonaws.com/uploads/1f65f319fc66053cc771a9875a94d071a6555ce4.png",
]


def sql_literal(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def array_literal(items: list[str]) -> str:
    if not items:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(sql_literal(item) for item in items) + "]"

statements: list[str] = []
statements.append("-- Generated by scripts/generate_seed_market_sql.py")
statements.append("-- Source: itdaing_seed.json")
statements.append("BEGIN;")

statements.append(
    "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names})),\n"
    "     target_zone_cell AS (SELECT id FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area)),\n"
    "     target_popups AS (SELECT id FROM popup WHERE zone_cell_id IN (SELECT id FROM target_zone_cell) OR description LIKE '%{marker}%')\n"
    "DELETE FROM popup_category WHERE popup_id IN (SELECT id FROM target_popups);".format(names=zone_name_list, marker=SEED_MARKER)
)

for table in [
    "popup_style",
    "popup_feature",
    "popup_image",
    "review",
    "wishlist",
    "daily_consumer_recommendation",
    "metric_daily_popup",
    "user_reco_dismissal"
]:
    statements.append(
        "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names})),\n"
        "     target_zone_cell AS (SELECT id FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area)),\n"
        "     target_popups AS (SELECT id FROM popup WHERE zone_cell_id IN (SELECT id FROM target_zone_cell) OR description LIKE '%{marker}%')\n"
        f"DELETE FROM {table} WHERE popup_id IN (SELECT id FROM target_popups);".format(names=zone_name_list, marker=SEED_MARKER)
    )

statements.append(
    "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names})),\n"
    "     target_zone_cell AS (SELECT id FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area)),\n"
    "     target_popups AS (SELECT id FROM popup WHERE zone_cell_id IN (SELECT id FROM target_zone_cell) OR description LIKE '%{marker}%')\n"
    "DELETE FROM event_log WHERE popup_id IN (SELECT id FROM target_popups);".format(names=zone_name_list, marker=SEED_MARKER)
)

statements.append(
    "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names})),\n"
    "     target_zone_cell AS (SELECT id FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area)),\n"
    "     target_popups AS (SELECT id FROM popup WHERE zone_cell_id IN (SELECT id FROM target_zone_cell) OR description LIKE '%{marker}%')\n"
    "DELETE FROM popup WHERE id IN (SELECT id FROM target_popups);".format(names=zone_name_list, marker=SEED_MARKER)
)

statements.append(
    "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names})),\n"
    "     target_zone_cell AS (SELECT id FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area))\n"
    "DELETE FROM zone_availability WHERE zone_cell_id IN (SELECT id FROM target_zone_cell);".format(names=zone_name_list)
)

statements.append(
    "WITH target_zone_area AS (SELECT id FROM zone_area WHERE name IN ({names}))\n"
    "DELETE FROM zone_cell WHERE zone_area_id IN (SELECT id FROM target_zone_area);".format(names=zone_name_list)
)
statements.append(
    "DELETE FROM zone_area WHERE name IN ({names});".format(names=zone_name_list)
)

statements.append(
    "CREATE TABLE IF NOT EXISTS guardrail_policy (\n"
    "    id SERIAL PRIMARY KEY,\n"
    "    service_area VARCHAR(255) UNIQUE NOT NULL,\n"
    "    forbidden_keywords TEXT[] NOT NULL,\n"
    "    disallowed_topics TEXT[] NOT NULL,\n"
    "    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
    ");"
)

statements.append(
    "INSERT INTO guardrail_policy (service_area, forbidden_keywords, disallowed_topics)\n"
    f"VALUES ({sql_literal(guardrails['service_area'])}, {array_literal(guardrails['forbidden_keywords'])}, {array_literal(guardrails['disallowed_topics'])})\n"
    "ON CONFLICT (service_area) DO UPDATE SET\n"
    "    forbidden_keywords = EXCLUDED.forbidden_keywords,\n"
    "    disallowed_topics = EXCLUDED.disallowed_topics,\n"
    "    updated_at = CURRENT_TIMESTAMP;"
)

category_values = []
for item in payload["categories"]:
    category_values.append(
        f"({sql_literal(item['name'])}, {sql_literal(item['type'])}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    )
if category_values:
    statements.append(
        "INSERT INTO category (name, type, created_at, updated_at) VALUES\n" + ",\n".join(category_values) + "\n"
        "ON CONFLICT (type, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP(6);"
    )

style_values = [
    f"({sql_literal(item['name'])}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    for item in payload["styles"]
]
if style_values:
    statements.append(
        "INSERT INTO style (name, created_at, updated_at) VALUES\n" + ",\n".join(style_values) + "\n"
        "ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP(6);"
    )

feature_values = [
    f"({sql_literal(item['name'])}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    for item in payload["features"]
]
if feature_values:
    statements.append(
        "INSERT INTO feature (name, created_at, updated_at) VALUES\n" + ",\n".join(feature_values) + "\n"
        "ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP(6);"
    )

region_values = [
    f"({sql_literal(item['name'])}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    for item in payload["regions"]
]
if region_values:
    statements.append(
        "INSERT INTO region (name, created_at, updated_at) VALUES\n" + ",\n".join(region_values) + "\n"
        "ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP(6);"
    )

seller_user_values = []
for seller in sellers:
    login = seller["login_id"]
    name = seller["name"]
    email = f"{login}@itdaing.com"
    seller_user_values.append(
        f"({sql_literal(login)}, {sql_literal(PASSWORD_HASH)}, {sql_literal(name)}, {sql_literal(name)}, {sql_literal(email)}, 'SELLER', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    )

if seller_user_values:
    statements.append(
        "INSERT INTO users (login_id, password, name, nickname, email, role, created_at, updated_at) VALUES\n" + ",\n".join(seller_user_values) + "\n"
        "ON CONFLICT (login_id) DO UPDATE SET\n"
        "    password = EXCLUDED.password,\n"
        "    name = EXCLUDED.name,\n"
        "    nickname = EXCLUDED.nickname,\n"
        "    email = EXCLUDED.email,\n"
        "    role = EXCLUDED.role,\n"
        "    updated_at = CURRENT_TIMESTAMP(6);"
    )

for seller in sellers:
    login = seller["login_id"]
    intro = seller.get("intro") or "광주 지역 플리마켓 셀러"
    activity_region = region_map.get(seller.get("activity_region"), seller.get("activity_region", "광주"))
    specialty = category_map.get(seller.get("specialty"), seller.get("specialty", ""))
    statements.append(
        "INSERT INTO seller_profile (user_id, introduction, activity_region, category, contact_phone, created_at, updated_at) VALUES\n"
        f"    ((SELECT id FROM users WHERE login_id = {sql_literal(login)}), {sql_literal(intro)}, {sql_literal(activity_region)}, {sql_literal(specialty)}, NULL, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))\n"
        "ON CONFLICT (user_id) DO UPDATE SET\n"
        "    introduction = EXCLUDED.introduction,\n"
        "    activity_region = EXCLUDED.activity_region,\n"
        "    category = EXCLUDED.category,\n"
        "    updated_at = CURRENT_TIMESTAMP(6);"
    )

consumer_user_values = []
for consumer in consumers:
    login = consumer["login_id"]
    name = consumer.get("name", login)
    email = f"{login}@itdaing.com"
    age_group = consumer.get("age_group")
    mbti = (consumer.get("mbti") or "").upper() or None
    consumer_user_values.append(
        f"({sql_literal(login)}, {sql_literal(PASSWORD_HASH)}, {sql_literal(name)}, {sql_literal(name)}, {sql_literal(email)}, {age_group if age_group is not None else 'NULL'}, {sql_literal(mbti)}, 'CONSUMER', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))"
    )

if consumer_user_values:
    statements.append(
        "INSERT INTO users (login_id, password, name, nickname, email, age_group, mbti, role, created_at, updated_at) VALUES\n" + ",\n".join(consumer_user_values) + "\n"
        "ON CONFLICT (login_id) DO UPDATE SET\n"
        "    password = EXCLUDED.password,\n"
        "    name = EXCLUDED.name,\n"
        "    nickname = EXCLUDED.nickname,\n"
        "    email = EXCLUDED.email,\n"
        "    age_group = EXCLUDED.age_group,\n"
        "    mbti = EXCLUDED.mbti,\n"
        "    role = EXCLUDED.role,\n"
        "    updated_at = CURRENT_TIMESTAMP(6);"
    )

if consumer_logins:
    login_list = ", ".join(sql_literal(login) for login in sorted(consumer_logins))
    statements.append(f"DELETE FROM user_pref_category WHERE user_id IN (SELECT id FROM users WHERE login_id IN ({login_list}));")
    statements.append(f"DELETE FROM user_pref_style WHERE user_id IN (SELECT id FROM users WHERE login_id IN ({login_list}));")
    statements.append(f"DELETE FROM user_pref_feature WHERE user_id IN (SELECT id FROM users WHERE login_id IN ({login_list}));")
    statements.append(f"DELETE FROM user_pref_region WHERE user_id IN (SELECT id FROM users WHERE login_id IN ({login_list}));")

for consumer in consumers:
    login = consumer["login_id"]
    fav_categories = consumer.get("favorite_categories", [])
    for cat in fav_categories:
        cat_name = category_map[cat]
        statements.append(
            "INSERT INTO user_pref_category (user_id, category_id)\n"
            f"SELECT u.id, c.id\n"
            f"FROM users u, category c\n"
            f"WHERE u.login_id = {sql_literal(login)} AND c.name = {sql_literal(cat_name)}\n"
            "ON CONFLICT DO NOTHING;"
        )
    fav_styles = consumer.get("favorite_styles", [])
    for sty in fav_styles:
        sty_name = style_map[sty]
        statements.append(
            "INSERT INTO user_pref_style (user_id, style_id)\n"
            f"SELECT u.id, s.id\n"
            f"FROM users u, style s\n"
            f"WHERE u.login_id = {sql_literal(login)} AND s.name = {sql_literal(sty_name)}\n"
            "ON CONFLICT DO NOTHING;"
        )
    statements.append(
        "INSERT INTO user_pref_region (user_id, region_id)\n"
        f"SELECT u.id, r.id\n"
        f"FROM users u, region r\n"
        f"WHERE u.login_id = {sql_literal(login)} AND r.name = '광주'\n"
        "ON CONFLICT DO NOTHING;"
    )

for zone in zones:
    region_name = region_map[zone["region_id"]]
    feature_names = [feature_map[fid] for fid in zone.get("features", [])]
    geometry_payload = {
        "seed_ref": SEED_TAG,
        "source_zone_id": zone["zone_id"],
        "theme": zone.get("theme"),
        "features": feature_names
    }
    geometry_json = json.dumps(geometry_payload, ensure_ascii=False)
    statements.append(
        "INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)\n"
        f"VALUES ((SELECT id FROM region WHERE name = {sql_literal(region_name)}), {sql_literal(zone['name'])}, {sql_literal(geometry_json)}, {sql_literal(zone.get('status', 'AVAILABLE'))}, {zone.get('max_capacity', 'NULL')}, {sql_literal(zone.get('notice'))}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));"
    )
    for cell in zone["cells"]:
        cell_info = cell_geo[cell["cell_id"]]
        owner_login = cell.get("owner_login")
        owner_subquery = "(SELECT id FROM users WHERE login_id = {login})".format(login=sql_literal(owner_login)) if owner_login else "(SELECT id FROM users WHERE login_id = 'seller1')"
        notice_with_marker = (cell_info.get("notice") or zone.get("notice") or "") + f" {SEED_MARKER}"
        statements.append(
            "INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)\n"
            f"VALUES ((SELECT id FROM zone_area WHERE name = {sql_literal(zone['name'])}), {owner_subquery}, {sql_literal(cell_info['label'])}, {sql_literal(zone['name'] + ' ' + cell_info['label'])}, {cell_info['lat']}, {cell_info['lng']}, {sql_literal(cell_info['status'])}, {cell_info['max_capacity']}, {sql_literal(notice_with_marker)}, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));"
        )

for idx, popup in enumerate(popups):
    popup_name = f"{popup['name']} (#{popup['popup_id']})"
    description = popup.get("description", "")
    event_tags = popup.get("event_tags", [])
    if event_tags:
        description_with_tags = description + f"\n\n{SEED_MARKER} event_tags: " + ", ".join(event_tags)
    else:
        description_with_tags = description + f"\n\n{SEED_MARKER}"
    start_offset = (idx % 40) - 10
    start_date = BASE_DATE + timedelta(days=start_offset)
    end_date = start_date + timedelta(days=20 + (idx % 10))
    zone_info = cell_geo[popup["cell_id"]]
    zone_name = zone_info["zone_name"]
    cell_label = zone_info["label"]
    statements.append(
        "INSERT INTO popup (seller_id, zone_cell_id, name, description, start_date, end_date, operating_time, approval_status, view_count, created_at, updated_at)\n"
        f"VALUES ((SELECT id FROM users WHERE login_id = {sql_literal(popup['seller_login'])}),\n"
        f"        (SELECT zc.id FROM zone_cell zc JOIN zone_area za ON za.id = zc.zone_area_id WHERE za.name = {sql_literal(zone_name)} AND zc.label = {sql_literal(cell_label)} ORDER BY zc.id LIMIT 1),\n"
        f"        {sql_literal(popup_name)},\n"
        f"        {sql_literal(description_with_tags)},\n"
        f"        {sql_literal(start_date.isoformat())},\n"
        f"        {sql_literal(end_date.isoformat())},\n"
        f"        {sql_literal(popup.get('operating_time'))},\n"
        f"        {sql_literal(popup.get('approval_status', 'PENDING'))},\n"
        f"        {popup.get('view_count', 0)},\n"
        "        CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));"
    )
    image_url = s3_images[idx % len(s3_images)]
    statements.append(
        "INSERT INTO popup_image (popup_id, image_url, is_thumbnail, created_at)\n"
        f"SELECT p.id, {sql_literal(image_url)}, TRUE, CURRENT_TIMESTAMP(6)\n"
        f"FROM popup p WHERE p.name = {sql_literal(popup_name)}\n"
        "ON CONFLICT DO NOTHING;"
    )
    for cat in popup.get("categories", []):
        cat_name = category_map[cat]
        statements.append(
            "INSERT INTO popup_category (popup_id, category_id, category_role)\n"
            f"SELECT p.id, c.id, 'POPUP'\n"
            f"FROM popup p, category c\n"
            f"WHERE p.name = {sql_literal(popup_name)} AND c.name = {sql_literal(cat_name)}\n"
            "ON CONFLICT DO NOTHING;"
        )
    for sty in popup.get("styles", []):
        sty_name = style_map[sty]
        statements.append(
            "INSERT INTO popup_style (popup_id, style_id)\n"
            f"SELECT p.id, s.id\n"
            f"FROM popup p, style s\n"
            f"WHERE p.name = {sql_literal(popup_name)} AND s.name = {sql_literal(sty_name)}\n"
            "ON CONFLICT DO NOTHING;"
        )
    for feat in popup.get("features", []):
        feat_name = feature_map[feat]
        statements.append(
            "INSERT INTO popup_feature (popup_id, feature_id)\n"
            f"SELECT p.id, f.id\n"
            f"FROM popup p, feature f\n"
            f"WHERE p.name = {sql_literal(popup_name)} AND f.name = {sql_literal(feat_name)}\n"
            "ON CONFLICT DO NOTHING;"
        )

statements.append("COMMIT;")

OUTPUT_PATH.write_text("\n".join(statements) + "\n", encoding="utf-8")
print(f"Generated SQL seed script at {OUTPUT_PATH}")
