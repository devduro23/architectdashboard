const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/payouts
router.get('/', (req, res) => {
  const db = getDb();
  const payouts = db
    .prepare('SELECT * FROM payouts WHERE architect_id = ? ORDER BY site_name, product_code')
    .all(req.architectId);
  res.json({ payouts });
});

// GET /api/payouts/summary
router.get('/summary', (req, res) => {
  const db = getDb();

  // Scheme payout totals
  const schemeTotals = db.prepare(`
    SELECT
      COUNT(DISTINCT site_name) AS scheme_sites,
      SUM(eligible_qty)         AS total_eligible_qty,
      SUM(calculated_payout)    AS total_scheme_payout,
      SUM(CASE WHEN UPPER(remit) = 'NO' THEN 1 ELSE 0 END) AS pending_remittance
    FROM payouts WHERE architect_id = ?
  `).get(req.architectId);

  const bySite = db.prepare(`
    SELECT site_name,
           SUM(calculated_payout) AS total_payout,
           SUM(eligible_qty)      AS total_qty
    FROM payouts WHERE architect_id = ?
    GROUP BY site_name ORDER BY total_payout DESC
  `).all(req.architectId);

  // Business transaction totals (from Architect Buss sheet)
  const bizTotals = db.prepare(`
    SELECT
      COUNT(*)              AS total_transactions,
      SUM(business_amount)  AS total_business_amount,
      SUM(payout)           AS total_biz_payout,
      SUM(quantity)         AS total_quantity
    FROM business_transactions WHERE architect_id = ?
  `).get(req.architectId);

  // Business payout by product (top 10)
  const bizByProduct = db.prepare(`
    SELECT product_details,
           SUM(quantity)        AS total_qty,
           SUM(business_amount) AS total_amount,
           SUM(payout)          AS total_payout
    FROM business_transactions WHERE architect_id = ?
    GROUP BY product_details ORDER BY total_amount DESC
    LIMIT 10
  `).all(req.architectId);

  // Business payout chart by dealer
  const bizByDealer = db.prepare(`
    SELECT dealer_name,
           SUM(payout) AS total_payout,
           SUM(quantity) AS total_qty
    FROM business_transactions WHERE architect_id = ?
    GROUP BY dealer_name ORDER BY total_payout DESC
    LIMIT 8
  `).all(req.architectId);

  // Sites count
  const sitesCount = db.prepare(
    'SELECT COUNT(*) as c FROM sites WHERE architect_id = ?'
  ).get(req.architectId).c;

  res.json({
    summary: schemeTotals,
    bySite,
    bizTotals,
    bizByProduct,
    bizByDealer,
    sitesCount,
  });
});

// GET /api/payouts/business
router.get('/business', (req, res) => {
  const db = getDb();
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 50);
  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT * FROM business_transactions
    WHERE architect_id = ?
    ORDER BY purchase_date DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(req.architectId, limit, offset);

  const total = db.prepare(
    'SELECT COUNT(*) as c FROM business_transactions WHERE architect_id = ?'
  ).get(req.architectId).c;

  res.json({ transactions: rows, total, page, limit });
});

module.exports = router;
