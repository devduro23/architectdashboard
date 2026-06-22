require('dotenv').config();
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
const { initDb, getDb } = require('./db');

const EXCEL_PATH = path.join(__dirname, 'data', 'architects_data.xlsx');

// ── helpers ──────────────────────────────────────────────────────────────────

function safeStr(v) {
  if (v == null) return null;
  const s = v.toString().trim();
  return s === '' ? null : s;
}

function safeNum(v) {
  if (v == null) return 0;
  const n = parseFloat(v.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function normName(v) {
  return v ? v.toString().trim().toLowerCase().replace(/\s+/g, ' ') : '';
}

function normMobile(v) {
  return v ? v.toString().replace(/\D/g, '').slice(-10) : '';
}

// Excel serial date → readable string
function excelDate(v) {
  if (!v) return null;
  if (typeof v === 'string' && isNaN(Number(v))) return v.trim() || null;
  const d = XLSX.SSF.parse_date_code(Number(v));
  if (!d) return null;
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
}

// ── load Excel ────────────────────────────────────────────────────────────────

async function seed() {
  await initDb();
  const db = getDb();

  let wb;
  try {
    wb = XLSX.readFile(EXCEL_PATH);
  } catch {
    console.error(`\n❌  Excel not found at ${EXCEL_PATH}\n`);
    process.exit(1);
  }

  console.log('📄 Sheets:', wb.SheetNames.join(', '));

  // Find each sheet by keyword
  function findSheet(...keywords) {
    const n = wb.SheetNames.find(s =>
      keywords.some(k => s.toLowerCase().includes(k))
    );
    return n ? XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '' }) : [];
  }

  const masterRows   = findSheet('master profil');            // Architect Master Profiling
  const payoutRows   = findSheet('pay-out', 'payout');        // Pay-Out Sheet
  const siteRows     = findSheet('site detail');              // Site Details
  const bizRows      = findSheet('buss');                     // Architect Buss 24-35

  console.log(`\n📊 Rows loaded:`);
  console.log(`   Architect Master Profiling : ${masterRows.length}`);
  console.log(`   Pay-Out Sheet              : ${payoutRows.length}`);
  console.log(`   Site Details               : ${siteRows.length}`);
  console.log(`   Business Transactions      : ${bizRows.length}`);

  // ── clear DB ────────────────────────────────────────────────────────────────
  db.exec(`
    DELETE FROM business_transactions;
    DELETE FROM payouts;
    DELETE FROM sites;
    DELETE FROM architects;
  `);

  // ── 1. Seed architects from Architect Master Profiling ─────────────────────
  // Columns: Architect Mobile Number, Architect Name, Selling Branch,
  //          Sum of Bussiness Amount, Sum of Pay-Out, Tier, Eligible for Scheme

  const insertArch = db.prepare(`
    INSERT OR IGNORE INTO architects
      (name, mobile, password_hash, tier, selling_branch, total_business_amount, total_payout, eligible_for_scheme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const architectIdByMobile = new Map(); // mobile(10) → id
  const architectIdByName   = new Map(); // normName   → id

  for (const row of masterRows) {
    const name   = safeStr(row['Architect Name']);
    const mobile = normMobile(row['Architect Mobile Number']);
    if (!name || !mobile) continue;

    const hash = await bcrypt.hash(mobile, 12);
    try {
      const r = insertArch.run(
        name,
        mobile,
        hash,
        safeStr(row['Tier']),
        safeStr(row['Selling Branch']),
        safeNum(row['Sum of Bussiness Amount (23-25))']),
        safeNum(row['Sum of Pay-Out']),
        safeStr(row['Eligible for Scheme'])
      );
      let id = r.lastInsertRowid;
      if (!id) {
        id = db.prepare('SELECT id FROM architects WHERE mobile = ?').get(mobile)?.id;
      }
      if (id) {
        architectIdByMobile.set(mobile, id);
        architectIdByName.set(normName(name), id);
      }
    } catch (e) {
      console.warn(`  ⚠ Skipped ${name}:`, e.message);
    }
  }

  // Also add any architects from Pay-Out sheet that aren't in Master Profiling
  for (const row of payoutRows) {
    const name   = safeStr(row['Architect Name']);
    const mobile = normMobile(row['Mobile Number']);
    if (!name || !mobile) continue;
    if (architectIdByMobile.has(mobile)) continue;

    const hash = await bcrypt.hash(mobile, 12);
    try {
      const r = insertArch.run(name, mobile, hash, safeStr(row['Tier']),
        safeStr(row['Mapped ISR']), 0, 0, null);
      let id = r.lastInsertRowid;
      if (!id) id = db.prepare('SELECT id FROM architects WHERE mobile = ?').get(mobile)?.id;
      if (id) {
        architectIdByMobile.set(mobile, id);
        architectIdByName.set(normName(name), id);
      }
    } catch {}
  }

  console.log(`\n✅ Architects seeded: ${architectIdByMobile.size}`);

  // ── 2. Build site lookup: lead_code → site row ─────────────────────────────
  // Site Details columns: Lead Code, Project Name, Linked Architect,
  //   Locality, City, State, Lead Stage, Lead Status, Source Of Lead,
  //   Type Of Project, Decision Maker, Expected Maturity Date,
  //   Linked Dealer, Linked Influencer, Latest Task Type, Latest Task Status,
  //   Created Date, Adress

  const siteByLeadCode = new Map();
  for (const row of siteRows) {
    const lc = safeStr(row['Lead Code'])?.trim().replace(/\s+/g, '');
    if (lc) siteByLeadCode.set(lc, row);
  }

  const insertSite = db.prepare(`
    INSERT INTO sites (
      architect_id, lead_code, project_name, linked_dealer, linked_influencer,
      locality, city, state, lead_stage, lead_status, expected_maturity_date,
      source_of_lead, type_of_project, decision_maker,
      latest_task_type, latest_task_status, created_date, address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Track which (architect_id, lead_code) pairs already inserted to avoid dupes
  const insertedSites = new Set();

  function insertSiteRow(archId, siteRow) {
    const lc = safeStr(siteRow['Lead Code'])?.trim().replace(/\s+/g, '') || null;
    const key = `${archId}::${lc}`;
    if (insertedSites.has(key)) return;
    insertedSites.add(key);
    insertSite.run(
      archId,
      lc,
      safeStr(siteRow['Project Name']),
      safeStr(siteRow['Linked Dealer']),
      safeStr(siteRow['Linked Influencer']),
      safeStr(siteRow['Locality']),
      safeStr(siteRow['City']),
      safeStr(siteRow['State']),
      safeStr(siteRow['Lead Stage']),
      safeStr(siteRow['Lead Status']),
      excelDate(siteRow['Expected Maturity Date']) || safeStr(siteRow['Expected Maturity Date']),
      safeStr(siteRow['Source Of Lead']),
      safeStr(siteRow['Type Of Project']),
      safeStr(siteRow['Decision Maker']),
      safeStr(siteRow['Latest Task Type']),
      safeStr(siteRow['Latest Task Status']),
      excelDate(siteRow['Created Date']) || safeStr(siteRow['Created Date']),
      safeStr(siteRow['Adress']) || safeStr(siteRow['Address'])
    );
  }

  // Path A: Sites linked via Linked Architect column
  let sitesViaLinkedArch = 0;
  for (const row of siteRows) {
    const linked = safeStr(row['Linked Architect']);
    if (!linked) continue;
    // "Linked Architect" may contain "ID | Name" format
    const namePart = linked.includes('|') ? linked.split('|')[1].trim() : linked.trim();
    const archId = architectIdByName.get(normName(namePart));
    if (!archId) continue;
    insertSiteRow(archId, row);
    sitesViaLinkedArch++;
  }

  // ── 3. Seed payouts from Pay-Out Sheet ─────────────────────────────────────
  // Columns: Architect Name, Mobile Number, Mapped ISR, Lead Number,
  //          Site Name, Product Code, Eligible Qty, Tier, Calculated Payout, Remmit

  const insertPayout = db.prepare(`
    INSERT INTO payouts (architect_id, lead_number, site_name, product_code,
      eligible_qty, tier, calculated_payout, remit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let payoutsInserted = 0;
  let sitesViaPayoutLead = 0;

  for (const row of payoutRows) {
    const mobile  = normMobile(row['Mobile Number']);
    const name    = safeStr(row['Architect Name']);
    let archId    = architectIdByMobile.get(mobile);
    if (!archId && name) archId = architectIdByName.get(normName(name));
    if (!archId) continue;

    const leadNum = safeStr(row['Lead Number'])?.trim().replace(/\s+/g, '');
    const remit   = safeStr(row['Remmit']) || safeStr(row['Remit']) || 'NO';

    insertPayout.run(
      archId,
      leadNum,
      safeStr(row['Site Name']),
      safeStr(row['Product Code']),
      safeNum(row['Eligible Qty']),
      safeStr(row['Tier']),
      safeNum(row['Calculated Payout']),
      remit.toUpperCase()
    );
    payoutsInserted++;

    // Path B: link site via Lead Number → Lead Code
    if (leadNum) {
      const siteRow = siteByLeadCode.get(leadNum);
      if (siteRow) {
        insertSiteRow(archId, siteRow);
        sitesViaPayoutLead++;
      }
    }
  }

  console.log(`✅ Payouts seeded: ${payoutsInserted}`);
  console.log(`✅ Sites seeded: ${insertedSites.size} (${sitesViaLinkedArch} via Linked Architect, ${sitesViaPayoutLead} via Lead Number)`);

  // ── 4. Seed business transactions from Architect Buss sheet ────────────────
  // Columns: Selling Branch, Architect Name, Architect Mobile Number,
  //   City, State, Product In Details, Quantity, Business Amount,
  //   Dealer Involve, Purchase Date, Dealer Invoice Number, % Commission, Pay-Out

  const insertBiz = db.prepare(`
    INSERT INTO business_transactions
      (architect_id, selling_branch, city, state, product_details,
       quantity, business_amount, dealer_name, purchase_date,
       dealer_invoice, commission_pct, payout)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let bizInserted = 0;
  for (const row of bizRows) {
    const mobile = normMobile(row['Architect Mobile Number']);
    const name   = safeStr(row['Architect Name']);
    let archId   = architectIdByMobile.get(mobile);
    if (!archId && name) archId = architectIdByName.get(normName(name));
    if (!archId) continue;

    insertBiz.run(
      archId,
      safeStr(row['Selling Branch']),
      safeStr(row['City']),
      safeStr(row['State']),
      safeStr(row['Product In Details']),
      safeNum(row['Quantity']),
      safeNum(row['Bussiness Amount']),
      safeStr(row['Dealer Involve']),
      excelDate(row['Purchase Date']) || safeStr(row['Purchase Date']),
      safeStr(row['Dealer Invoice Number']),
      safeNum(row['% Commission']),
      safeNum(row['Pay-Out'])
    );
    bizInserted++;
  }

  console.log(`✅ Business transactions seeded: ${bizInserted}`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n🎉  Database seeded successfully!\n');

  const totalArchs   = db.prepare('SELECT COUNT(*) as c FROM architects').get().c;
  const totalSites   = db.prepare('SELECT COUNT(*) as c FROM sites').get().c;
  const totalPayouts = db.prepare('SELECT COUNT(*) as c FROM payouts').get().c;
  const totalBiz     = db.prepare('SELECT COUNT(*) as c FROM business_transactions').get().c;

  console.log(`   Architects         : ${totalArchs}`);
  console.log(`   Sites              : ${totalSites}`);
  console.log(`   Payout records     : ${totalPayouts}`);
  console.log(`   Business txns      : ${totalBiz}`);

  console.log('\n📋  Sample logins (mobile = password):');
  db.prepare('SELECT name, mobile, tier FROM architects LIMIT 8').all()
    .forEach(a => console.log(`   ${a.mobile}  →  ${a.name}  [${a.tier || 'No Tier'}]`));

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
