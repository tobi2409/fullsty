import * as pgWrapper from './pg-wrapper'
import { sql } from './sql-template-tag-wrapper'

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const result = await pgWrapper.getPgPool().query(sql`SELECT 1 AS number`)
    return `Hello, ${name}! This is the server speaking. Query result: ${JSON.stringify(result.rows[0]['number'])}`
}