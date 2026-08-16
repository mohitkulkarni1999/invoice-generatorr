import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || null

if (connectionString) {
  // node-postgres treats `sslmode=require` as verify-full in recent versions,
  // which fails against managed providers (Supabase pooler). Strip the param
  // and rely on the explicit ssl config below instead.
  connectionString = connectionString
    .replace(/([?&])sslmode=[^&]*/i, '$1')
    .replace(/[?&]$/, '')
}

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'invoice_generator',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      max: 10,
      idleTimeoutMillis: 30000,
    })

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err)
})

export const query = (text, params) => pool.query(text, params)

export default pool
