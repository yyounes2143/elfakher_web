const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

// ===============================================
// POST /api/auth/login - تسجيل الدخول
// ===============================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
            });
        }

        // البحث عن المستخدم باستخدام رقم الهاتف أو البريد الإلكتروني كـ username
        const result = await db.query(`
            SELECT id, first_name, last_name, role, password_hash, is_active
            FROM core.users
            WHERE (email = $1 OR phone = $1)
        `, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        const user = result.rows[0];

        // التأكد من أن الحساب نشط وأنه مدير
        if (!user.is_active || (user.role !== 'admin' && user.role !== 'super_admin')) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للدخول إلى لوحة التحكم'
            });
        }

        // التحقق من كلمة المرور
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        // توليد التوكن
        const token = generateToken(user);

        // تحديث تاريخ آخر تسجيل دخول
        await db.query(`UPDATE core.users SET last_login_at = NOW() WHERE id = $1`, [user.id]);

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token: token,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
});

// ===============================================
// GET /api/auth/verify - التحقق من الجلسة الحالية
// ===============================================
const { authMiddleware } = require('../middleware/auth');
router.get('/verify', authMiddleware, (req, res) => {
    // إذا وصل الطلب إلى هنا فهذا يعني أن authMiddleware نجح
    res.json({
        success: true,
        user: req.user
    });
});

// ===============================================
// GET /api/auth/setup-status - التحقق من الاحتياج للإعداد الأولي
// ===============================================
router.get('/setup-status', async (req, res) => {
    try {
        const result = await db.query(`SELECT id FROM core.users WHERE role IN ('admin', 'super_admin') LIMIT 1`);
        res.json({
            success: true,
            needsSetup: result.rows.length === 0
        });
    } catch (error) {
        console.error('Setup status error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من حالة الإعداد'
        });
    }
});

// ===============================================
// POST /api/auth/setup - إنشاء اول مدير للنظام
// ===============================================
router.post('/setup', async (req, res) => {
    try {
        // التحقق أولا ما إذا كان هناك طلب إعداد مسبق
        const checkResult = await db.query(`SELECT id FROM core.users WHERE role IN ('admin', 'super_admin') LIMIT 1`);
        if (checkResult.rows.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن إنشاء حساب مدير جديد، النظام مهيأ مسبقاً.'
            });
        }

        const { first_name, last_name, phone, email, password } = req.body;

        if (!first_name || !last_name || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى ملء جميع الحقول المطلوبة'
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم
        const insertResult = await db.query(`
            INSERT INTO core.users (
                first_name, 
                last_name, 
                phone, 
                email, 
                password_hash, 
                role, 
                is_active, 
                is_verified
            ) VALUES ($1, $2, $3, $4, $5, 'super_admin', true, true)
            RETURNING id, first_name, last_name, role
        `, [first_name, last_name, phone, email, hashedPassword]);

        const user = insertResult.rows[0];

        // توليد التوكن وتسجيل الدخول فورا بعد الإنشاء
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'تم إعداد النظام وإنشاء المدير بنجاح',
            token: token,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Setup error:', error);
        
        if (error.code === '23505') { // unique_violation
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل'
            });
        }
        
        if (error.code === '23514') { // check_violation
            return res.status(400).json({
                success: false,
                message: 'قيمة رقم الهاتف غير صالحة للصيغة الجزائرية'
            });
        }

        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إعداد المدير الجديد'
        });
    }
});

module.exports = router;
