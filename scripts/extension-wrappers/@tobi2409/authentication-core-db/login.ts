import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
// @ts-ignore kysely is supplied by the server package in generated projects.
import { KyselyWrapper } from '../../kysely/kysely-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreKyselyLogin {
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
            const db = KyselyWrapper.buildQueryCompiler(
                dbConnection.getDriverName()
            )

            const compiledQuery = db
                .selectFrom(tableName)
                .select([
                    KyselyWrapper.sql.ref(columns.uuid).as('uuid'),
                    KyselyWrapper.sql.ref(columns.mail).as('mail'),
                    KyselyWrapper.sql.ref(columns.password).as('password'),
                    KyselyWrapper.sql.ref(columns.isActive).as('isActive')
                ])
                .where(KyselyWrapper.sql.ref(columns.mail), '=', typedMail)
                .limit(1)
                .compile()

            // 'any' is used instead of 'unknown' because calling .query() on an unknown type requires
            // either a type assertion or a separate interface. DbConnection is driver-agnostic, so
            // the concrete pool type (e.g. pg.Pool) is not available here without adding a dependency.
            const connection = (await dbConnection.getConnection()) as any
            const result = await connection.query(
                compiledQuery.sql,
                compiledQuery.parameters
            )

            const fetchedUser = mapFetchedUser(
                result.rows?.[0] as Record<string, unknown> | undefined
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
