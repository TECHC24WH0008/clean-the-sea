-- 001_initial_schema.sql
-- CLEAN-THE-SEA 初期スキーマ
-- PostGIS拡張の有効化、全テーブル作成、制約・インデックス定義

-- PostGIS拡張の有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- contributors テーブル（投稿者）
-- ============================================================
CREATE TABLE contributors (
    id          VARCHAR(64)   PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    total_points INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- submissions テーブル（投稿データ）
-- ============================================================
CREATE TABLE submissions (
    id              SERIAL            PRIMARY KEY,
    contributor_id  VARCHAR(64)       NOT NULL REFERENCES contributors(id),
    latitude        DOUBLE PRECISION  NOT NULL,
    longitude       DOUBLE PRECISION  NOT NULL,
    density         VARCHAR(10)       NOT NULL CHECK (density IN ('low', 'medium', 'high')),
    photo_path      VARCHAR(500),
    location        GEOMETRY(POINT, 4326) NOT NULL,
    submitted_at    TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- PostGIS空間インデックス（バウンディングボックスクエリ高速化）
CREATE INDEX idx_submissions_location ON submissions USING GIST (location);

-- ============================================================
-- point_history テーブル（ポイント履歴）
-- ============================================================
CREATE TABLE point_history (
    id              SERIAL       PRIMARY KEY,
    contributor_id  VARCHAR(64)  NOT NULL REFERENCES contributors(id),
    submission_id   INTEGER      NOT NULL REFERENCES submissions(id),
    points_earned   INTEGER      NOT NULL,
    earned_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- recovery_projects テーブル（回収プロジェクト）
-- ============================================================
CREATE TABLE recovery_projects (
    id              SERIAL          PRIMARY KEY,
    location_name   VARCHAR(200)    NOT NULL,
    recovered_tons  DOUBLE PRECISION NOT NULL,
    photo_url       VARCHAR(500)    NOT NULL,
    description     TEXT,
    conducted_at    DATE            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);
