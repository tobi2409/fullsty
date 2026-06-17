import dotenv from 'dotenv'
import fs from 'fs'
import knex, { type Knex } from 'knex'

const connections = new Map<string, Knex>()
let knexEnv: Record<string, string> = {}
let knexEnvLoaded = false

function envKey(connectionName: string, key: string): string {
  const prefix = connectionName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
  return `${prefix}_${key}`
}

function loadKnexEnv(): void {
  if (knexEnvLoaded) {
    return
  }

  // Load .env.knex into a local cache instead of writing into process.env.
  // This keeps the Knex wrapper isolated from other wrappers such as auth,
  // which may load their own .env files later.
  const envFileContent = fs.existsSync('.env.knex')
    ? fs.readFileSync('.env.knex', 'utf8')
    : ''

  knexEnv = dotenv.parse(envFileContent)
  knexEnvLoaded = true
}

function getEnv(connectionName: string, key: string, fallback?: string): string {
  loadKnexEnv()
  return knexEnv[envKey(connectionName, key)] ?? fallback ?? ''
}

export function getKnexDatabase(connectionName: string = 'default'): Knex {
  const existing = connections.get(connectionName)
  if (existing) {
    return existing
  }

  const db = knex({
    client: getEnv(connectionName, 'CLIENT', 'pg') as Knex.Config['client'],
    connection: {
      host: getEnv(connectionName, 'PGHOST', '127.0.0.1'),
      port: Number(getEnv(connectionName, 'PGPORT', '5432')),
      user: getEnv(connectionName, 'PGUSER', 'postgres'),
      password: getEnv(connectionName, 'PGPASSWORD', 'postgres'),
      database: getEnv(connectionName, 'PGDATABASE', 'fullsty_demo')
    },
    pool: {
      min: Number(getEnv(connectionName, 'POOL_MIN', '0')),
      max: Number(getEnv(connectionName, 'POOL_MAX', '10'))
    }
  })

  connections.set(connectionName, db)
  return db
}

export async function closeKnexDatabase(connectionName: string = 'default'): Promise<void> {
  const db = connections.get(connectionName)

  if (!db) {
    return
  }

  await db.destroy()
  connections.delete(connectionName)
}

export async function closeAllKnexDatabases(): Promise<void> {
  const all = [...connections.entries()]

  for (const [name, db] of all) {
    await db.destroy()
    connections.delete(name)
  }
}
