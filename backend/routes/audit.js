const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authRequired, requireRole } = require('../middleware/auth');

// List audit logs (admin/manager)
router.get('/', authRequired, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { limit = 100, page = 1, action, resource, userId, q } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;
    if (q) filter.$or = [
      { actorName: { $regex: q, $options: 'i' } },
      { action: { $regex: q, $options: 'i' } },
      { resource: { $regex: q, $options: 'i' } }
    ];
    const size = Math.min(Number(limit), 500);
    const skip = (Number(page) - 1) * size;
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size).populate('user', 'name email role'),
      AuditLog.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pageSize: size });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;


