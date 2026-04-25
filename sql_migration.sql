-- Drop color-related tables and constraints if exists
ALTER TABLE orders.order_items DROP CONSTRAINT IF EXISTS order_items_color_id_fkey;
ALTER TABLE catalog.fabric_colors DROP CONSTRAINT IF EXISTS fabric_colors_color_id_fkey;
ALTER TABLE catalog.product_variants DROP CONSTRAINT IF EXISTS product_variants_color_id_fkey;

DROP TABLE IF EXISTS catalog.fabric_colors CASCADE;
DROP TABLE IF EXISTS catalog.colors CASCADE;

-- Drop color-related columns in products
ALTER TABLE catalog.products DROP COLUMN IF EXISTS available_color_ids;
ALTER TABLE catalog.products DROP COLUMN IF EXISTS embedded_colors;
ALTER TABLE catalog.products DROP COLUMN IF EXISTS size_color_availability;
ALTER TABLE catalog.products DROP COLUMN IF EXISTS image_color_linking_enabled;

-- Drop color from order_items (optional but keeps it clean since they don't pick colors anymore)
ALTER TABLE orders.order_items DROP COLUMN IF EXISTS color_id;
ALTER TABLE orders.order_items DROP COLUMN IF EXISTS color_name;
