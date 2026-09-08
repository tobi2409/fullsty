import dotenv from 'dotenv'
import { DbConnection } from './db-connection/db-connection-wrapper.ts'
import { authenticationCoreLib } from './@tobi2409/authentication-core-lib/authentication-core-lib-wrapper.ts'
import { AuthenticationCoreDrizzleLogin } from './@tobi2409/authentication-core-db/login.ts'
import { AuthenticationCoreDrizzleCurrentUser } from './@tobi2409/authentication-core-db/current-user.ts'
import { AuthenticationCoreDrizzleRegister } from './@tobi2409/authentication-core-db/register.ts'

type MailTransportConfig = authenticationCoreLib.MailTransportConfig
type RegistrationInputData = authenticationCoreLib.RegistrationInputData
type VerificationMail = authenticationCoreLib.VerificationMail

dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not configured')
}

const dbConnection = new DbConnection('pg')

//@rest
export async function loginUser(
    email: string,
    password: string
): Promise<string> {
    return AuthenticationCoreDrizzleLogin.login(
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

    return await AuthenticationCoreDrizzleRegister.register(
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
    return AuthenticationCoreDrizzleCurrentUser.getCurrentUser(
        token,
        SECRET_KEY,
        dbConnection
    )
}
