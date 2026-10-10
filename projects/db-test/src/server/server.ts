import SQLQueryBuilder from '@tobi2409/sql-query-builder'
import { DbConnection } from './db-connection/db-connection-wrapper.ts'

const dbConnection = new DbConnection('pg')

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const query = new SQLQueryBuilder('pg')
        .select(['1 AS number'])
        .toSQL()

    const connection = (await dbConnection.getPool()) as any
    const result = await connection.query(query.text, query.values)

    return `Hello, ${name}! This is the server speaking. Query result: ${JSON.stringify((result.rows[0] as { number?: number } | undefined)?.number)}`
}
