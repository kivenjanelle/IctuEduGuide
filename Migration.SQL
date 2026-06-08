-- Run this in your PostgreSQL database once
-- Creates the quiz_questions table and adds question_count to quizzes

CREATE TABLE IF NOT EXISTS quiz_questions (
  id               SERIAL PRIMARY KEY,
  quiz_id          INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type    VARCHAR(20) NOT NULL DEFAULT 'mcq',  -- 'mcq' or 'structural'
  question_text    TEXT NOT NULL,
  option_a         TEXT,
  option_b         TEXT,
  option_c         TEXT,
  option_d         TEXT,
  correct_option   VARCHAR(1),   -- 'A', 'B', 'C', or 'D'
  model_answer     TEXT,
  marks            INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Add question_count column to quizzes if it doesn't exist
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;