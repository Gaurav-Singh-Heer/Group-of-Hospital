// Route guards based on the session set at login.

// Require a logged-in user. For API/JSON requests responds 401; for page
// requests redirects to the login page.
function requireAuth(req, res, next) {
  if (req.session && req.session.email) return next();
  if (req.accepts('html')) return res.redirect('/login');
  return res.status(401).json({ error: 'Not authenticated' });
}

// Require an admin user. Must run after requireAuth (or on its own — it also
// checks for a session).
function requireAdmin(req, res, next) {
  if (req.session && req.session.email && req.session.role === 'admin') return next();
  if (req.accepts('html')) return res.status(403).send('Forbidden: admins only');
  return res.status(403).json({ error: 'Admins only' });
}

module.exports = { requireAuth, requireAdmin };
