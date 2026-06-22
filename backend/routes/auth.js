const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile and password are required' });
  }

  const db = getDb();
  const cleanMobile = mobile.toString().trim().replace(/\D/g, '');

  const architect = db.prepare('SELECT * FROM architects WHERE mobile = ?').get(cleanMobile);

  if (!architect) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, architect.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { architectId: architect.id, name: architect.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, COOKIE_OPTIONS);

  res.json({
    architect: {
      id: architect.id,
      name: architect.name,
      mobile: architect.mobile,
      mapped_isr: architect.mapped_isr,
      tier: architect.tier,
      selling_branch: architect.selling_branch,
      total_business_amount: architect.total_business_amount,
      total_payout: architect.total_payout,
      eligible_for_scheme: architect.eligible_for_scheme,
    },
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const architect = db
    .prepare('SELECT id, name, mobile, mapped_isr, tier, selling_branch, total_business_amount, total_payout, eligible_for_scheme FROM architects WHERE id = ?')
    .get(req.architectId);

  if (!architect) {
    return res.status(404).json({ error: 'Architect not found' });
  }

  res.json({ architect });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const db = getDb();
  const architect = db.prepare('SELECT * FROM architects WHERE id = ?').get(req.architectId);

  const valid = await bcrypt.compare(currentPassword, architect.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE architects SET password_hash = ? WHERE id = ?').run(newHash, req.architectId);

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
