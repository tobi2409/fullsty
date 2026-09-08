import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { DrizzleWrapper } from '../../drizzle/drizzle-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDrizzleCurrentUser {
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
            // The wrapper only stores the driver name and is very lightweight;
            // the pool is supplied per query context, so repeated initialization is safe.
            const drizzleWrapper = new DrizzleWrapper(
                dbConnection.getDriverName()
            )
            const db = drizzleWrapper.buildQueryBuilder(
                await dbConnection.getPool()
            )
            const users = drizzleWrapper.buildTable(tableName, columns, {
                uuid: 'uuid',
                isActive: 'boolean'
            })

            const isActiveCallback = async (uuid: string): Promise<boolean> => {
                const result = await db
                    .select({ isActive: users.isActive })
                    .from(users)
                    .where(DrizzleWrapper.eq(users.uuid, uuid))
                    .limit(1)

                if (!result[0]) {
                    return false
                }

                return Boolean(result[0].isActive)
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
