function parseRoles(value) {
  if (!value) {
    return ['user']
  }

  return String(value)
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean)
}

function attachRequestUser(req, _res, next) {
  const headerRoles = parseRoles(req.get('x-user-roles') || req.get('x-user-role'))

  req.user = {
    id: req.get('x-user-id') || null,
    roles: headerRoles,
  }

  next()
}

function requiredRole(...allowedRoles) {
  const normalizedRoles = allowedRoles.map((role) => String(role).trim().toLowerCase())

  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : ['user']
    const isAllowed = userRoles.some((role) => normalizedRoles.includes(String(role).toLowerCase()))

    if (isAllowed) {
      return next()
    }

    return res.status(403).json({ message: 'Forbidden' })
  }
}

module.exports = {
  attachRequestUser,
  requiredRole,
  parseRoles,
}
