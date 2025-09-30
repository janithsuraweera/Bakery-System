const jwt = require('jsonwebtoken');

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

function authRequired(req, res, next) {
  if (!AUTH_ENABLED) {
    req.user = { role: 'admin', name: 'Dev', id: null };
    return next();
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!AUTH_ENABLED) return next();
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { authRequired, requireRole };


