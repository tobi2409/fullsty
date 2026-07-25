import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
// @ts-ignore kysely is supplied by the server package in generated projects.
import { KyselyWrapper } from '../../kysely/kysely-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreKyselyRegister {
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

    export async function register(
        registrationInputData: authenticationCoreLib.RegistrationInputData,
        customInputData: Record<string, unknown>,
        verificationMail: authenticationCoreLib.VerificationMail,
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN,
        mailTransportConfig?: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreRegister.register
        >[5],
        hashOptions?: Parameters<
            typeof authenticationCoreLib.AuthenticationCoreRegister.register
        >[6]
    ): Promise<authenticationCoreLib.FetchedUser> {
        const db = KyselyWrapper.buildQueryCompiler(
            dbConnection.getDriverName()
        )

        // 'any' is used instead of 'unknown' because calling pool/client APIs on an unknown type requires
        // either a type assertion or a separate interface. DbConnection is driver-agnostic, so
        // the concrete pool/client type (e.g. pg.Pool/PoolClient) is not available here without adding a dependency.
        const pool = (await dbConnection.getConnection()) as any
        const transactionConnection = await pool.connect()

        const mailExistsRoutine = async (mail: string): Promise<boolean> => {
            const compiledQuery = db
                .selectFrom(tableName)
                .select((eb: any) => [eb.val(1).as('exists')])
                .where(KyselyWrapper.sql.ref(columns.mail), '=', mail)
                .limit(1)
                .compile()

            const result = await transactionConnection.query(
                compiledQuery.sql,
                compiledQuery.parameters
            )

            return (result.rows?.length ?? 0) > 0
        }

        const dataProcessing = async (
            identification: string,
            hashedPassword: string,
            inputData: Record<string, unknown>
        ): Promise<authenticationCoreLib.FetchedUser | undefined> => {
            const userData: Record<string, unknown> = {
                [columns.mail]: identification,
                [columns.password]: hashedPassword,
                [columns.isActive]: false,
                ...inputData
            }

            const compiledQuery = db
                .insertInto(tableName)
                .values(userData as any)
                .returning([
                    KyselyWrapper.sql.ref(columns.uuid).as('uuid'),
                    KyselyWrapper.sql.ref(columns.mail).as('mail'),
                    KyselyWrapper.sql.ref(columns.password).as('password'),
                    KyselyWrapper.sql.ref(columns.isActive).as('isActive')
                ])
                .compile()

            const result = await transactionConnection.query(
                compiledQuery.sql,
                compiledQuery.parameters
            )
            return mapFetchedUser(
                result.rows?.[0] as Record<string, unknown> | undefined
            )
        }

        try {
            await transactionConnection.query('BEGIN')

            const registeredUser =
                await authenticationCoreLib.AuthenticationCoreRegister.register(
                    registrationInputData,
                    mailExistsRoutine,
                    customInputData,
                    dataProcessing,
                    verificationMail,
                    mailTransportConfig,
                    hashOptions
                )

            await transactionConnection.query('COMMIT')
            return registeredUser
        } catch (error) {
            try {
                await transactionConnection.query('ROLLBACK')
            } catch {
                // Ignore rollback errors, original error is more relevant.
            }

            throw error
        } finally {
            if (typeof transactionConnection.release === 'function') {
                transactionConnection.release()
            }
        }
    }
}
