-- Radar Ecológico: human reviews
-- Run this once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS bill_reviews (
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  reviewed_by TEXT NOT NULL,                -- reviewer email
  reviewer_score INTEGER NOT NULL CHECK (reviewer_score BETWEEN 0 AND 100),
  reviewer_classification TEXT NOT NULL CHECK (
    reviewer_classification IN ('favorable', 'needs_review', 'unfavorable', 'neutral')
  ),
  reviewer_notes TEXT,
  not_related BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, external_id)
);

ALTER TABLE bill_reviews ENABLE ROW LEVEL SECURITY;

-- Authenticated reviewers can see and manage reviews.
CREATE POLICY "read own reviews" ON bill_reviews
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "insert reviews" ON bill_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update reviews" ON bill_reviews
  FOR UPDATE USING (auth.role() = 'authenticated');