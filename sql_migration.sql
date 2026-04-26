
DO $$
BEGIN
    -- Drop constraints if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'orders' AND table_name = 'order_items') THEN
        ALTER TABLE orders.order_items DROP CONSTRAINT IF EXISTS order_items_color_id_fkey;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'catalog' AND table_name = 'product_variants') THEN
        ALTER TABLE catalog.product_variants DROP CONSTRAINT IF EXISTS product_variants_color_id_fkey;
    END IF;
END $$;

-- Drop tables directly (CASCADE handles constraints from these tables)
DROP TABLE IF EXISTS catalog.fabric_colors CASCADE;
DROP TABLE IF EXISTS catalog.colors CASCADE;

DO $$
BEGIN
    -- Drop columns from products if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'catalog' AND table_name = 'products') THEN
        ALTER TABLE catalog.products DROP COLUMN IF EXISTS available_color_ids;
        ALTER TABLE catalog.products DROP COLUMN IF EXISTS embedded_colors;
        ALTER TABLE catalog.products DROP COLUMN IF EXISTS size_color_availability;
        ALTER TABLE catalog.products DROP COLUMN IF EXISTS image_color_linking_enabled;
    END IF;

    -- Drop columns from order_items if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'orders' AND table_name = 'order_items') THEN
        ALTER TABLE orders.order_items DROP COLUMN IF EXISTS color_id;
        ALTER TABLE orders.order_items DROP COLUMN IF EXISTS color_name;
    END IF;
END $$;
