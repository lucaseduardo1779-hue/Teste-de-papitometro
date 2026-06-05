import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildMatches } from './data/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, 'worldcup.db');

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS matches (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    stage      TEXT NOT NULL,
    grp        TEXT,
    matchday   INTEGER,
    label      TEXT NOT NULL,
    home_team  TEXT,
    away_team  TEXT,
    home_flag  TEXT,
    away_flag  TEXT,
    kickoff    TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    match_id       INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    home_score     INTEGER NOT NULL,
    away_score     INTEGER NOT NULL,
    updated_at     TEXT NOT NULL,
    UNIQUE(participant_id, match_id)
  );

  CREATE INDEX IF NOT EXISTS idx_pred_match ON predictions(match_id);
  CREATE INDEX IF NOT EXISTS idx_pred_part  ON predictions(participant_id);
`);

// Popula os jogos apenas na primeira execucao.
export function seedMatchesIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM matches').get();
  if (c > 0) return;

  const insert = db.prepare(`
    INSERT INTO matches
      (stage, grp, matchday, label, home_team, away_team, home_flag, away_flag, kickoff, sort_order)
    VALUES
      (@stage, @grp, @matchday, @label, @home_team, @away_team, @home_flag, @away_flag, @kickoff, @sort_order)
  `);

  const matches = buildMatches();
  db.exec('BEGIN');
  try {
    matches.forEach((m, i) => insert.run({ ...m, sort_order: i }));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  console.log(`Banco populado com ${matches.length} jogos.`);
}
