const { pool } = require('../config/database');

const colors = [
    { name_en: 'White', name_ar: 'أبيض', hex_code: '#FFFFFF', sort_order: 1 },
    { name_en: 'Navy', name_ar: 'كحلي', hex_code: '#1A232E', sort_order: 2 },
    { name_en: 'Blue', name_ar: 'أزرق', hex_code: '#1E40AF', sort_order: 3 },
    { name_en: 'Grey', name_ar: 'رمادي', hex_code: '#6B7280', sort_order: 4 },
    { name_en: 'Beige', name_ar: 'بيج', hex_code: '#F5F5DC', sort_order: 5 },
    { name_en: 'Black', name_ar: 'أسود', hex_code: '#000000', sort_order: 6 },
    { name_en: 'Brown', name_ar: 'بني', hex_code: '#5D4037', sort_order: 7 },
    { name_en: 'Green', name_ar: 'أخضر', hex_code: '#166534', sort_order: 8 },
    { name_en: 'Dark Red', name_ar: 'أحمر داكن', hex_code: '#991B1B', sort_order: 9 }
];

async function seedColors() {
    try {
        console.log('🌱 Starting color seeding...');

        if (colors.length === 0) {
            console.log('No colors to seed.');
            process.exit(0);
        }

        const values = [];
        const params = [];

        colors.forEach((color, i) => {
            const offset = i * 4;
            values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, true)`);
            params.push(color.name_en, color.name_ar, color.hex_code, color.sort_order);
        });

        const queryText = `
            INSERT INTO catalog.colors (name_en, name_ar, hex_code, sort_order, is_active)
            VALUES ${values.join(', ')}
            ON CONFLICT (hex_code) DO NOTHING
            RETURNING id, name_en;
        `;

        const result = await pool.query(queryText, params);

        if (result.rows.length > 0) {
            result.rows.forEach(row => {
                console.log(`Added new color: ${row.name_en} (ID: ${row.id})`);
            });
        }

        const skippedCount = colors.length - result.rows.length;
        if (skippedCount > 0) {
            console.log(`Skipped ${skippedCount} existing colors.`);
        }

        console.log('✅ Color seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding colors:', err);
        process.exit(1);
    }
}

seedColors();
