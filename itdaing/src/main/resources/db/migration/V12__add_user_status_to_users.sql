-- db/migration/Vxx__add_user_status_to_users.sql
ALTER TABLE users
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
