export type UserColumn = {
    uuid: string
    mail: string
    password: string
    isActive: string
}

export const DEFAULT_TABLE_NAME = 'users'

export const DEFAULT_USER_COLUMN: UserColumn = {
    uuid: 'uuid',
    mail: 'mail',
    password: 'password',
    isActive: 'isActive'
}

export function quoteIdentifier(identifier: string): string {
    return identifier
        .split('.')
        .map((part) => `"${part.replaceAll('"', '""')}"`)
        .join('.')
}
