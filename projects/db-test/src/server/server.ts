import { DbConnection } from './db-connection/db-connection-wrapper'
import { KyselyWrapper } from './kysely/kysely-wrapper'

const dbConnection = new DbConnection('pg')
const queryCompiler = KyselyWrapper.buildQueryCompiler('pg')

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const compiledQuery = KyselyWrapper.sql<{
        number: number
    }>`SELECT 1 AS number`.compile(queryCompiler)

    const connection = (await dbConnection.getConnection()) as any
    const result = await connection.query(compiledQuery.sql, [
        ...compiledQuery.parameters
    ])

    return `Hello, ${name}! This is the server speaking. Query result: ${JSON.stringify((result.rows[0] as { number?: number } | undefined)?.number)}`
}
