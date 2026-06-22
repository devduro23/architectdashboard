const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// GET /api/sites
router.get('/', (req, res) => {
  const db = getDb();
  const sites = db
    .prepare('SELECT * FROM sites WHERE architect_id = ? ORDER BY project_name ASC')
    .all(req.architectId);
  res.json({ sites });
});

// GET /api/sites/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const site = db
    .prepare('SELECT * FROM sites WHERE id = ? AND architect_id = ?')
    .get(req.params.id, req.architectId);

  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  // Also fetch payouts for this site
  const payouts = db
    .prepare('SELECT * FROM payouts WHERE architect_id = ? AND site_name = ?')
    .all(req.architectId, site.project_name);

  res.json({ site, payouts });
});

module.exports = router;
