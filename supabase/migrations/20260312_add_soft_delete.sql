-- ============================================================
-- Soft Delete: Add deleted_at to all user content tables
-- Items with deleted_at set are in "Trash" - hidden from public view.
-- Items are permanently deleted 30 days after deletion via pg_cron.
-- ============================================================

-- Add deleted_at column to each table (nullable; NULL = not deleted)
ALTER TABLE projects        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE experience      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE skills          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE blogs           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE education       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE certifications  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE testimonials    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index to speed up trash queries and cleanup job
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at        ON projects        (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_experience_deleted_at      ON experience      (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_deleted_at          ON skills          (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blogs_deleted_at           ON blogs           (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_education_deleted_at       ON education       (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_certifications_deleted_at  ON certifications  (user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testimonials_deleted_at    ON testimonials    (user_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================
-- Auto-purge function: hard-deletes items trashed for > 30 days
-- Schedule this with pg_cron: SELECT cron.schedule('purge-trash', '0 3 * * *', 'SELECT purge_old_trash()');
-- ============================================================
CREATE OR REPLACE FUNCTION purge_old_trash() RETURNS void AS $$
BEGIN
  DELETE FROM projects        WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM experience      WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM skills          WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM blogs           WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM education       WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM certifications  WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM testimonials    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
