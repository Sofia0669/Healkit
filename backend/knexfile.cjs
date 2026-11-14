const path = require('node:path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Falta ${key} en backend/.env`);
}

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
      loadExtensions: ['.cjs']
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      loadExtensions: ['.cjs']
    }
  }
};
