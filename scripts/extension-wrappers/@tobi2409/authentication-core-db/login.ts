import SQLQueryBuilder from '@tobi2409/sql-query-builder'
import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    quoteIdentifier,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDbLogin {
    function mapFetchedUser(
        row: Record<string, unknown> | undefined
    ): authenticationCoreLib.FetchedUser | undefined {
        if (!row) {
            return undefined
        }

        return {
            uuid: String(row.uuid),
            mail: String(row.mail),
            password: String(row.password),
            isActive: Boolean(row.isActive)
        }
    }

    export async function login(
        typedMail: string,
        typedPassword: string,
        jwtKey: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreLogin.login
        >[3],
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN,
        jwtOptions: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreLogin.login
        >[4] = {}
    ): Promise<string> {
        try {
            const query = new SQLQueryBuilder(dbConnection.getDriverName())
                .select([
                    `${quoteIdentifier(columns.uuid)} AS "uuid"`,
                    `${quoteIdentifier(columns.mail)} AS "mail"`,
                    `${quoteIdentifier(columns.password)} AS "password"`,
                    `${quoteIdentifier(columns.isActive)} AS "isActive"`
                ])
                .from(quoteIdentifier(tableName))
                .where(`${quoteIdentifier(columns.mail)} = ?`, [typedMail])
                .limit(1)
                .toSQL()
                
            const connection = (await dbConnection.getPool()) as any
            const result = await connection.query(query.text, query.values)

            const fetchedUser = mapFetchedUser(
                result.rows[0] as Record<string, unknown> | undefined
            )

            return authenticationCoreLib.AuthenticationCoreLogin.login(
                typedMail,
                typedPassword,
                fetchedUser,
                jwtKey,
                jwtOptions
            )
        } catch (error) {
            throw error
        }
    }
}
