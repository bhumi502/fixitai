// middleware/staffMiddleware.js - Restrict to Staff or Admin role
const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Staff or Admin privileges required',
    });
  }
};

module.exports = { staffOrAdmin };
