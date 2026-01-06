import Database from 'better-sqlite3';

export const db = new Database('cinexit.db');

db.exec(`
CREATE TABLE IF NOT EXISTS epochs (
  epoch INTEGER PRIMARY KEY,
  settled_usdc TEXT,
  tx_hash TEXT,
  block_number INTEGER
);

CREATE TABLE IF NOT EXISTS claims (
  user TEXT,
  epoch INTEGER,
  amount TEXT,
  tx_hash TEXT,
  PRIMARY KEY (user, epoch)
);
`);
