import dotenv from 'dotenv'
import fs from 'fs'
import { Pool } from 'pg'

const pools = new Map<string, Pool>()
let pgEnv: Record<string, string> = {}
let pgEnvLoaded = false

function envKey(connectionName: string, key: string): string {
  const prefix = connectionName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
  return `${prefix}_${key}`
}

function loadPgEnv(): void {
  if (pgEnvLoaded) {
    return
  }

  // Load .env.pg into a local cache instead of writing into process.env.
  // This keeps the pg wrapper isolated from other wrappers such as auth,
  // which may load their own .env files later.
  const envFileContent = fs.existsSync('.env.pg')
    ? fs.readFileSync('.env.pg', 'utf8')
    : ''

  pgEnv = dotenv.parse(envFileContent)
  pgEnvLoaded = true
}

function getEnv(connectionName: string, key: string, fallback?: string): string {
  loadPgEnv()
  return pgEnv[envKey(connectionName, key)] ?? fallback ?? ''
}

export function getPgPool(connectionName: string = 'default'): Pool {
  const existing = pools.get(connectionName)
  if (existing) {
    return existing
  }

  const pool = new Pool({
    host: getEnv(connectionName, 'PGHOST', '127.0.0.1'),
    port: Number(getEnv(connectionName, 'PGPORT', '5432')),
    user: getEnv(connectionName, 'PGUSER', 'postgres'),
    password: getEnv(connectionName, 'PGPASSWORD', 'postgres'),
    database: getEnv(connectionName, 'PGDATABASE', 'fullsty_demo'),
    max: Number(getEnv(connectionName, 'POOL_MAX', '10'))
  })

  pools.set(connectionName, pool)
  return pool
}

export async function closePgPool(connectionName: string = 'default'): Promise<void> {
  const pool = pools.get(connectionName)

  if (!pool) {
    return
  }

  await pool.end()
  pools.delete(connectionName)
}

export async function closeAllPgPools(): Promise<void> {
  const all = [...pools.entries()]

  for (const [name, pool] of all) {
    await pool.end()
    pools.delete(name)
  }
}