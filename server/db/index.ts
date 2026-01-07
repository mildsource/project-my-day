import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use environment variable or default path
// ⚠️ CRITICAL: Use process.cwd() - NEVER __dirname!
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'taskflow.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Database initialized at', dbPath);
}

// Helper for running queries
export function query<T = any>(text: string, params: any[] = []): T[] {
  const stmt = db.prepare(text);
  if (text.trim().toUpperCase().startsWith('SELECT')) {
    return stmt.all(...params) as T[];
  }
  stmt.run(...params);
  return [];
}

export function queryOne<T = any>(text: string, params: any[] = []): T | undefined {
  const stmt = db.prepare(text);
  if (text.trim().toUpperCase().startsWith('INSERT') && text.includes('RETURNING')) {
    // SQLite doesn't support RETURNING, handle separately
    const info = stmt.run(...params);
    const selectStmt = db.prepare('SELECT * FROM ' + text.match(/INTO\s+(\w+)/i)?.[1] + ' WHERE id = ?');
    return selectStmt.get(info.lastInsertRowid) as T | undefined;
  }
  if (text.trim().toUpperCase().startsWith('UPDATE') && text.includes('RETURNING')) {
    stmt.run(...params);
    const tableName = text.match(/UPDATE\s+(\w+)/i)?.[1];
    const idParam = params[params.length - 2]; // id is second to last param
    const selectStmt = db.prepare('SELECT * FROM ' + tableName + ' WHERE id = ?');
    return selectStmt.get(idParam) as T | undefined;
  }
  return stmt.get(...params) as T | undefined;
}
