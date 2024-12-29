import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrate() {
  try {
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'init.sql'),
      'utf8'
    );
    
    // Execute the entire SQL content as one statement
    await sql.query(sqlContent);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 