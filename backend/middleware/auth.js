const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập`
      });
    }
    next();
  };
};

// Verify Admin - Enhanced security middleware for admin routes
exports.verifyAdmin = async (req, res, next) => {
  try {
    // User must be authenticated first (protect middleware should run before this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    // Check if user role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Chỉ Admin mới được phép.'
      });
    }

    // Double check user is active
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản Admin đã bị vô hiệu hóa'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực quyền Admin'
    });
  }
};

