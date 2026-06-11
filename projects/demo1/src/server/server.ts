import knex, { type Knex } from 'knex'

declare const process: {
    env: Record<string, string | undefined>
}

let db: Knex | undefined

function getDb(): Knex {
    if (db) {
        return db
    }

    db = knex({
        client: 'pg',
        connection: {
            host: process.env.PGHOST ?? '127.0.0.1',
            port: Number(process.env.PGPORT ?? 5432),
            user: process.env.PGUSER ?? 'postgres',
            password: process.env.PGPASSWORD ?? 'postgres',
            database: process.env.PGDATABASE ?? 'fullsty_demo'
        },
        pool: {
            min: 0,
            max: 10
        }
    })

    return db
}

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const row = await getDb()
        .select<{ dbTime: string }[]>(getDb().raw('now()::text as "dbTime"'))
        .first()

    const dbTime = row?.dbTime ?? 'unknown'
    return `Hello, ${name}! DB time: ${dbTime}`
}

// @rest
export async function getDbHealth(): Promise<{ ok: boolean; dbTime: string }> {
    const row = await getDb()
        .select<{ dbTime: string }[]>(getDb().raw('now()::text as "dbTime"'))
        .first()

    return {
        ok: true,
        dbTime: row?.dbTime ?? 'unknown'
    }
}