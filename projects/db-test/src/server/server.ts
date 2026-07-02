import { DbConnection } from './db-connection/db-connection-wrapper'
// @ts-ignore drizzle runtime dependency is installed in generated/server
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from './drizzle-orm/drizzle-orm-wrapper'

const dbConnection = new DbConnection('pg')

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const drizzleInstance = drizzle(dbConnection.connect())
    const result = await drizzleInstance.execute<{ number: number }>(sql`SELECT 1 AS number`)
    return `Hello, ${name}! This is the server speaking. Query result: ${JSON.stringify(result.rows[0]?.number)}`
}