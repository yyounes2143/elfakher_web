require('dotenv').config();
const { query } = require('./config/database');

async function fixProductsTable() {
    try {
        console.log('Adding missing columns to catalog.products...');

        await query('ALTER TABLE catalog.products ADD COLUMN IF NOT EXISTS embedded_colors JSONB DEFAULT \'[]\'::jsonb;');
        await query('ALTER TABLE catalog.products ADD COLUMN IF NOT EXISTS size_color_availability JSONB DEFAULT \'{}\'::jsonb;');
        await query('ALTER TABLE catalog.products ADD COLUMN IF NOT EXISTS image_color_linking_enabled BOOLEAN DEFAULT false;');
        
        console.log('✅ Missing columns added successfully.');
    } catch(err) {
        console.error('❌ Migration failed:', err);
    }
    process.exit(0);
}

fixProductsTable();
