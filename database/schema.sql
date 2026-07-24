-- Enterprise Prompt Engineering Toolkit
-- Database Schema (SQLite / PostgreSQL compatible)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(100) DEFAULT 'General',
    content         TEXT NOT NULL,
    description     TEXT,
    tags            VARCHAR(500),
    variables       JSON,
    is_favorite     BOOLEAN DEFAULT FALSE,
    version_number  INTEGER DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompt versions (version history)
CREATE TABLE IF NOT EXISTS prompt_versions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id       INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    content         TEXT NOT NULL,
    variables       JSON,
    change_note     VARCHAR(500),
    created_by      VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id       INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    model_name      VARCHAR(100) NOT NULL,
    clarity         REAL,
    specificity     REAL,
    context_score   REAL,
    grammar         REAL,
    completeness    REAL,
    creativity      REAL,
    overall_score   REAL,
    strengths       JSON,
    weaknesses      JSON,
    suggestions     JSON,
    raw_response    TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id   ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category  ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_updated   ON prompts(updated_at);
CREATE INDEX IF NOT EXISTS idx_versions_prompt   ON prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_evals_prompt      ON evaluations(prompt_id);
