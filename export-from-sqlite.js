const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./prisma/dev.db', { readonly: true });

console.log('Exporting data from SQLite database...\n');

const tables = [
  'users',
  'categories',
  'authors',
  'reviewers',
  'articles',
  'reviews',
  'review_reviewers',
  'dentist_directory',
  'media',
  'redirects',
  'clinic_submissions',
  'analytics_snippets',
  'seo_settings',
  'password_reset_tokens'
];

const data = {};

for (const table of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    data[table] = rows;
    console.log(`✓ ${table}: ${rows.length} records`);
  } catch (error) {
    console.log(`✗ ${table}: table not found or error - ${error.message}`);
    data[table] = [];
  }
}

console.log('\nWriting to exported-data.json...');
fs.writeFileSync('./exported-data.json', JSON.stringify(data, null, 2));
console.log('✅ Export complete!');

const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\nTotal records exported: ${totalRecords}`);

db.close();
