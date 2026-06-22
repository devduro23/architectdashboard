const express = require('express');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');

const router = express.Router();

// Simple admin key check (for demo — use proper auth in production)
function requireAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// POST /admin/upload — trigger re-seed from existing Excel file
router.post('/reseed', requireAdmin, async (req, res) => {
  try {
    // Run seed logic inline (same as seed.js but returns JSON)
    const { execSync } = require('child_process');
    execSync('node seed.js', { cwd: __dirname + '/..', timeout: 30000 });
    res.json({ message: 'Database re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Re-seed failed', details: err.message });
  }
});

// GET /admin/stats — database stats
router.get('/stats', requireAdmin, (req, res) => {
  const db = getDb();
  const architects = db.prepare('SELECT COUNT(*) as count FROM architects').get();
  const sites = db.prepare('SELECT COUNT(*) as count FROM sites').get();
  const payouts = db.prepare('SELECT COUNT(*) as count FROM payouts').get();
  res.json({ architects: architects.count, sites: sites.count, payouts: payouts.count });
});

module.exports = router;
