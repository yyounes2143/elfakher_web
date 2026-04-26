const fs = require("fs");
const path = require("path");
const db = require("../config/database");

async function runMigrations() {
  try {
    console.log("Checking for pending migrations...");

    // 1. Check if migration was already run
    // We will create a simple table to track migrations if it doesn't exist
    await db.query(`
            CREATE TABLE IF NOT EXISTS system_migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    const migrationName = "remove_colors_refactor";

    const { rows } = await db.query(
      "SELECT * FROM system_migrations WHERE name = $1",
      [migrationName],
    );

    if (rows.length > 0) {
      console.log(
        `Migration '${migrationName}' has already been run. Skipping.`,
      );
      return;
    }

    console.log(`Running migration '${migrationName}'...`);

    // 2. Read the SQL file
    const sqlPath = path.join(__dirname, "../../sql_migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // 3. Execute the SQL
    await db.query(sql);

    // 4. Record the migration
    await db.query("INSERT INTO system_migrations (name) VALUES ($1)", [
      migrationName,
    ]);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    // Note: We don't throw here to prevent the server from crashing if DB isn't ready
    // But we log it so it can be fixed
  }
}

module.exports = { runMigrations };
