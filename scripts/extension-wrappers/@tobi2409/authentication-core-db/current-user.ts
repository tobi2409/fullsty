import { DbConnection } from "../../db-connection/db-connection-wrapper.ts";
// @ts-ignore kysely is supplied by the server package in generated projects.
import { KyselyWrapper } from "../../kysely/kysely-wrapper.ts";
import { authenticationCoreLib } from "../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts";
import { DEFAULT_TABLE_NAME, DEFAULT_USER_COLUMN, UserColumn } from "./shared.ts";

export namespace AuthenticationCoreKyselyCurrentUser {
    export async function getCurrentUser(
        token: string,
        jwtKey: Parameters<typeof authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser>[1],
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN,
        verifyOptions: Parameters<typeof authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser>[3] = {}
    ): Promise<string> {
        try {
            const db = KyselyWrapper.buildQueryCompiler(dbConnection.getDriverName());

            const isActiveCallback = async (uuid: string): Promise<boolean> => {
                const compiledQuery = db
                    .selectFrom(tableName)
                    .select([
                        KyselyWrapper.sql.ref(columns.isActive).as("isActive")
                    ])
                    .where(KyselyWrapper.sql.ref(columns.uuid), "=", uuid)
                    .limit(1)
                    .compile();

                // 'any' is used instead of 'unknown' because calling .query() on an unknown type requires
                // either a type assertion or a separate interface. DbConnection is driver-agnostic, so
                // the concrete pool type (e.g. pg.Pool) is not available here without adding a dependency.
                const connection = await dbConnection.getConnection() as any;
                const result = await connection.query(compiledQuery.sql, compiledQuery.parameters);

                if (!result.rows?.[0]) {
                    return false;
                }

                return Boolean((result.rows[0] as Record<string, unknown>).isActive);
            };

            return authenticationCoreLib.AuthenticationCoreCurrentUser.getCurrentUser(token, jwtKey, isActiveCallback, verifyOptions);
        } catch (error) {
            throw error;
        }
    }
}
