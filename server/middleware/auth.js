const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'elfakher_super_secret_key_2026'; // يجب وضع هذا في ملف .env

function authMiddleware(req, res, next) {
    // تم تعطيل المصادقة مؤقتاً بناءً على طلب المستخدم
    // req.user dummy object to prevent errors in endpoints that expect user info
    req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        role: 'super_admin',
        email: 'bypass@elfakher.dz',
        name: 'System Admin (Bypass)'
    };
    next();
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = { authMiddleware, generateToken };
