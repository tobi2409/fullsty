import SQLQueryBuilder from '@tobi2409/sql-query-builder'
import { DbConnection } from '../../db-connection/db-connection-wrapper.ts'
import { authenticationCoreLib } from '../../@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import {
    DEFAULT_TABLE_NAME,
    DEFAULT_USER_COLUMN,
    quoteIdentifier,
    UserColumn
} from './shared.ts'

export namespace AuthenticationCoreDbRegister {
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
        const pool = (await dbConnection.getPool()) as any
        const transaction = await pool.connect()

        try {
            await transaction.query('BEGIN')

            const mailExistsRoutine = async (mail: string): Promise<boolean> => {
                const query = new SQLQueryBuilder(dbConnection.getDriverName())
                    .select([quoteIdentifier(columns.mail)])
                    .from(quoteIdentifier(tableName))
                    .where(`${quoteIdentifier(columns.mail)} = ?`, [mail])
                    .limit(1)
                    .toSQL()

                const result = await transaction.query(query.text, query.values)

                return result.rows.length > 0
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

                const query = new SQLQueryBuilder(dbConnection.getDriverName())
                    .insertInto(
                        quoteIdentifier(tableName),
                        Object.keys(userData).map(quoteIdentifier)
                    )
                    .values(Object.values(userData))
                    .returning([
                        `${quoteIdentifier(columns.uuid)} AS "uuid"`,
                        `${quoteIdentifier(columns.mail)} AS "mail"`,
                        `${quoteIdentifier(columns.password)} AS "password"`,
                        `${quoteIdentifier(columns.isActive)} AS "isActive"`
                    ])
                    .toSQL()

                const result = await transaction.query(query.text, query.values)

                return mapFetchedUser(
                    result.rows[0] as Record<string, unknown> | undefined
                )
            }

            const registeredUser = await authenticationCoreLib.AuthenticationCoreRegister.register(
                registrationInputData,
                mailExistsRoutine,
                customInputData,
                dataProcessing,
                verificationMail,
                mailTransportConfig,
                hashOptions
            )
            await transaction.query('COMMIT')
            return registeredUser
        } catch (error) {
            await transaction.query('ROLLBACK')
            throw error
        } finally {
            transaction.release()
        }
    }

    export async function activateMail(
        uuid: string,
        dbConnection: DbConnection,
        tableName: string = DEFAULT_TABLE_NAME,
        columns: UserColumn = DEFAULT_USER_COLUMN
    ): Promise<void> {
        const query = new SQLQueryBuilder(dbConnection.getDriverName())
            .update(quoteIdentifier(tableName))
            .setRaw(`${quoteIdentifier(columns.isActive)} = ?`, [true])
            .where(`${quoteIdentifier(columns.uuid)} = ?`, [uuid])
            .toSQL()
            
        const connection = (await dbConnection.getPool()) as any
        await connection.query(query.text, query.values)
    }
}
