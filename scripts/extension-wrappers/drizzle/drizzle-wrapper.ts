// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { eq, sql as drizzleSql, type SQL } from 'drizzle-orm'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { drizzle } from 'drizzle-orm/node-postgres'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { boolean as pgBoolean, integer, pgTable, text, uuid as pgUuid } from 'drizzle-orm/pg-core'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { PgDialect } from 'drizzle-orm/pg-core'

type DriverName = 'pg' | 'mysql' | 'sqlite'
type ColumnType = 'text' | 'boolean' | 'integer' | 'uuid'

export class DrizzleWrapper {
    static readonly sql = drizzleSql
    static readonly eq = eq

    // The pool connection belongs to the current query or transaction and can
    // therefore change between calls. Apart from the driver name, this wrapper
    // holds no state and is very lightweight, so it can safely be initialized
    // more than once. buildQueryBuilder receives the appropriate connection.
    constructor(private readonly driverName: DriverName) {}

    buildQueryBuilder(connection: unknown): any {
        this.assertPostgresDriver()

        // Creating the Drizzle instance does not execute a query. It only creates
        // a lightweight executable facade around the supplied pool or transaction
        // connection; database work starts when a built query is awaited.
        return drizzle(connection as any)
    }

    buildTable(
        tableName: string,
        columns: Record<string, string>,
        columnTypes: Record<string, ColumnType> = {}
    ): any {
        this.assertPostgresDriver()

        // pgTable only creates lightweight metadata for an existing table; it does
        // not open a connection, query, create, or migrate anything. Missing tables
        // or columns fail when the query is executed. Columns default to text unless
        // a PostgreSQL type is explicitly supplied.
        return pgTable(
            tableName,
            Object.fromEntries(
                Object.entries(columns).map(([propertyName, columnName]) => [
                    propertyName,
                    this.buildColumn(columnName, columnTypes[propertyName])
                ])
            ) as any
        )
    }

    private buildColumn(columnName: string, columnType: ColumnType = 'text'): any {
        switch (columnType) {
            case 'boolean':
                return pgBoolean(columnName)
            case 'integer':
                return integer(columnName)
            case 'uuid':
                return pgUuid(columnName)
            default:
                return text(columnName)
        }
    }

    buildQueryCompiler(): {
        compile(query: SQL): { sql: string; parameters: unknown[] }
    } {
        this.assertPostgresDriver()

        const dialect = new PgDialect()
        return {
            compile(query) {
                const compiledQuery = dialect.sqlToQuery(query)
                return {
                    sql: compiledQuery.sql,
                    parameters: compiledQuery.params
                }
            }
        }
    }

    private assertPostgresDriver(): void {
        if (this.driverName !== 'pg') {
            throw new Error(`Driver is not integrated yet: ${this.driverName}`)
        }
    }
}