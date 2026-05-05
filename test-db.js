const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:VqBXmwrtNzMkP1JP@db.zqoavjhusaijuobuqyoq.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully!');
    console.log('Current time:', result.rows[0].now);

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('\nExisting tables:', tables.rows.map(r => r.table_name));

    await pool.end();
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
