const AuditLog = require('../models/AuditLog');

async function writeAudit(req, { action, resource, resourceId, metadata }) {
  try {
    const actor = req.user || {};
    await AuditLog.create({
      user: actor.id || null,
      actorName: actor.name || 'Anonymous',
      role: actor.role || 'anonymous',
      action,
      resource,
      resourceId,
      metadata,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (e) {
    // avoid blocking flows on audit errors
  }
}

module.exports = { writeAudit };


