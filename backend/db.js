const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'archportal.db');

let db = null;
let SqlJs = null;

async function initSqlJs() {
  if (!SqlJs) SqlJs = await require('sql.js')();
  return SqlJs;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function runSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS architects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mapped_isr TEXT,
      tier TEXT,
      selling_branch TEXT,
      total_business_amount REAL DEFAULT 0,
      total_payout REAL DEFAULT 0,
      eligible_for_scheme TEXT
    );

    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      architect_id INTEGER REFERENCES architects(id),
      lead_code TEXT,
      project_name TEXT,
      linked_dealer TEXT,
      linked_influencer TEXT,
      locality TEXT,
      city TEXT,
      state TEXT,
      lead_stage TEXT,
      lead_status TEXT,
      expected_maturity_date TEXT,
      source_of_lead TEXT,
      type_of_project TEXT,
      decision_maker TEXT,
      latest_task_type TEXT,
      latest_task_status TEXT,
      created_date TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      architect_id INTEGER REFERENCES architects(id),
      lead_number TEXT,
      site_name TEXT,
      product_code TEXT,
      eligible_qty INTEGER,
      tier TEXT,
      calculated_payout REAL,
      remit TEXT
    );

    CREATE TABLE IF NOT EXISTS business_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      architect_id INTEGER REFERENCES architects(id),
      selling_branch TEXT,
      city TEXT,
      state TEXT,
      product_details TEXT,
      quantity INTEGER,
      business_amount REAL,
      dealer_name TEXT,
      purchase_date TEXT,
      dealer_invoice TEXT,
      commission_pct REAL,
      payout REAL
    );
  `);
}

function makeStmt(sql) {
  return {
    run(...params) {
      const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      db.run(sql, flat);
      const idRes = db.exec('SELECT last_insert_rowid() as id');
      const lastInsertRowid = idRes[0]?.values[0]?.[0] ?? null;
      saveDb();
      return { lastInsertRowid };
    },
    get(...params) {
      const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const stmt = db.prepare(sql);
      stmt.bind(flat);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all(...params) {
      const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const res = db.exec(sql, flat);
      if (!res.length) return [];
      const { columns, values } = res[0];
      return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
    },
  };
}

function getDbFacade() {
  return {
    prepare(sql) { return makeStmt(sql); },
    exec(sql) { db.exec(sql); saveDb(); },
    pragma() {},
  };
}

let facade = null;

async function initDb() {
  if (facade) return facade;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  runSchema();
  saveDb();
  facade = getDbFacade();
  return facade;
}

function getDb() {
  if (!facade) throw new Error('DB not initialized. Call await initDb() first.');
  return facade;
}

module.exports = { getDb, initDb };
