import * as knexWrapper from './knex-wrapper'

// @rest
export async function helloFromServer(name: string): Promise<string> {
    const row = await knexWrapper.getKnexDatabase()
        .select<{ dbTime: string }[]>(knexWrapper.getKnexDatabase().raw('now()::text as "dbTime"'))
        .first()

    const dbTime = row?.dbTime ?? 'unknown'
    return `Hello, ${name}! DB time: ${dbTime}`
}