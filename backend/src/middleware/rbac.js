// Simple RBAC middleware skeleton
module.exports = function requiredRole(role) {
  return (req, res, next) => {
    // This is a placeholder. In production, extract user+roles from JWT/session.
    const user = req.user || { roles: ['user'] }
    if (user.roles && user.roles.includes(role)) return next()
    return res.status(403).json({ message: 'Forbidden' })
  }
}
