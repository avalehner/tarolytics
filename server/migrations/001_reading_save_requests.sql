-- Keep request identities even when a reading is deleted, so retries cannot
-- recreate it. Account deletion removes that account's request history.
CREATE TABLE IF NOT EXISTS reading_save_requests (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  payload_hash TEXT NOT NULL CHECK (length(payload_hash) = 64),
  reading_id UUID REFERENCES readings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, request_id)
);
