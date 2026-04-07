const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  const dbPath = path.resolve(__dirname, 'database.sqlite');
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

module.exports = getDb;
