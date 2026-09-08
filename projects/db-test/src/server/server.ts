import { DbConnection } from './db-connection/db-connection-wrapper'
import { DrizzleWrapper } from './drizzle/drizzle-wrapper'

const dbConnection = new DbConnection('pg')
const drizzleWrapper = new DrizzleWrapper('pg')
const queryCompiler = drizzleWrapper.buildQueryCompiler()

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const compiledQuery = queryCompiler.compile(
        DrizzleWrapper.sql`SELECT 1 AS number`
    )

    const connection = (await dbConnection.getPool()) as any
    const result = await connection.query(compiledQuery.sql, [
        ...compiledQuery.parameters
    ])

    return `Hello, ${name}! This is the server speaking. Query result: ${JSON.stringify((result.rows[0] as { number?: number } | undefined)?.number)}`
}
