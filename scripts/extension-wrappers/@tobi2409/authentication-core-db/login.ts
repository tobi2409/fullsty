import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { DrizzleWrapper } from '../../drizzle/drizzle-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDrizzleLogin {
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

            const result = await db
                .select({
                    uuid: users.uuid,
                    mail: users.mail,
                    password: users.password,
                    isActive: users.isActive
                })
                .from(users)
                .where(DrizzleWrapper.eq(users.mail, typedMail))
                .limit(1)

            const fetchedUser = mapFetchedUser(
                result[0] as Record<string, unknown> | undefined
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
