import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
// @ts-ignore drizzle-orm is supplied by the server package in generated projects.
import { DrizzleWrapper } from '../../drizzle/drizzle-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDrizzleRegister {
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

        return db.transaction(async (transactionDb: any) => {
            const mailExistsRoutine = async (mail: string): Promise<boolean> => {
                const result = await transactionDb
                    .select({ mail: users.mail })
                    .from(users)
                    .where(DrizzleWrapper.eq(users.mail, mail))
                    .limit(1)

                return result.length > 0
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

                const insertUsers = drizzleWrapper.buildTable(
                    tableName,
                    Object.fromEntries(
                        Object.keys({ ...columns, ...userData }).map((column) => [
                            column,
                            columns[column as keyof UserColumn] ?? column
                        ])
                    ),
                    { uuid: 'uuid', isActive: 'boolean' }
                )

                const result = await transactionDb
                    .insert(insertUsers)
                    .values(userData)
                    .returning({
                        uuid: insertUsers.uuid,
                        mail: insertUsers.mail,
                        password: insertUsers.password,
                        isActive: insertUsers.isActive
                    })

                return mapFetchedUser(
                    result[0] as Record<string, unknown> | undefined
                )
            }

            return authenticationCoreLib.AuthenticationCoreRegister.register(
                registrationInputData,
                mailExistsRoutine,
                customInputData,
                dataProcessing,
                verificationMail,
                mailTransportConfig,
                hashOptions
            )
        })
    }

    export async function activateMail(
        uuid: string,
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN
    ): Promise<void> {
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

        await db
            .update(users)
            .set({ [columns.isActive]: true })
            .where(DrizzleWrapper.eq(users.uuid, uuid))
    }
}
