import { DbConnection } from './db-connection/db-connection-wrapper.ts'
import { authenticationCoreLib } from './@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import { AuthenticationCoreKyselyLogin } from './@tobi2409/authentication-core-db/login.ts'
import { AuthenticationCoreKyselyCurrentUser } from './@tobi2409/authentication-core-db/current-user.ts'
import { AuthenticationCoreKyselyRegister } from './@tobi2409/authentication-core-db/register.ts'

type MailTransportConfig = authenticationCoreLib.MailTransportConfig
type RegistrationInputData = authenticationCoreLib.RegistrationInputData
type VerificationMail = authenticationCoreLib.VerificationMail

const SECRET_KEY = 'zLp6Qzrm76vCcM3YoihruIcaYktJjc2Xt/c9qftftx4='
const dbConnection = new DbConnection('pg')

//@rest
export async function loginUser(
    email: string,
    password: string
): Promise<string> {
    return AuthenticationCoreKyselyLogin.login(
        email,
        password,
        SECRET_KEY,
        dbConnection
    )
}

//@rest
export async function registerUser(
    email: string,
    password: string
): Promise<void> {
    const registrationInputData: RegistrationInputData = {
        typedMail: email,
        typedPassword: password,
        typedPasswordRepeated: password
    }

    const verificationMail: VerificationMail = {
        from: 'no-reply@local.test',
        subject: 'Verify your account',
        content: (uuid: string) =>
            `Please verify your account by clicking the following link: https://example.com/verify?uuid=${uuid}`
    }

    const mailTransportConfig: MailTransportConfig = {
        host: '127.0.0.1',
        port: 1025,
        secure: false,
        auth: {
            user: '',
            pass: ''
        }
    }

    return await AuthenticationCoreKyselyRegister.register(
        registrationInputData,
        {},
        verificationMail,
        dbConnection,
        undefined,
        undefined,
        mailTransportConfig
    )
}

//@rest
export async function getCurrentUser(token: string): Promise<string> {
    return AuthenticationCoreKyselyCurrentUser.getCurrentUser(
        token,
        SECRET_KEY,
        dbConnection
    )
}
