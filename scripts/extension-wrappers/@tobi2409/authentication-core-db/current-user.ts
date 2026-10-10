import SQLQueryBuilder from '@tobi2409/sql-query-builder'
import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    quoteIdentifier,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDbCurrentUser {
    export async function getCurrentUser(
        token: string,
        jwtKey: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser
        >[1],
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN,
        verifyOptions: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser
        >[3] = {}
    ): Promise<string> {
        try {
            const connection = (await dbConnection.getPool()) as any

            const isActiveCallback = async (uuid: string): Promise<boolean> => {
                const query = new SQLQueryBuilder(dbConnection.getDriverName())
                    .select([`${quoteIdentifier(columns.isActive)} AS "isActive"`])
                    .from(quoteIdentifier(tableName))
                    .where(`${quoteIdentifier(columns.uuid)} = ?`, [uuid])
                    .limit(1)
                    .toSQL()
                    
                const result = await connection.query(query.text, query.values)

                if (!result.rows[0]) {
                    return false
                }

                return Boolean(result.rows[0].isActive)
            }

            return authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser(
                token,
                jwtKey,
                isActiveCallback,
                verifyOptions
            )
        } catch (error) {
            throw error
        }
    }
}
