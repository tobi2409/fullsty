// @ts-ignore kysely is supplied by the server package in generated projects.
import * as k from "kysely";

type DriverName = "pg" | "mysql" | "sqlite";

export namespace KyselyWrapper {
	export const sql = k.sql;

	export function getKysely(): typeof k {
		return k;
	}

	export function buildQueryCompiler(driverName: DriverName): k.Kysely<any> {
		const kysely = getKysely() as any;

		if (driverName === "pg") {
			return new kysely.Kysely({
				dialect: {
					createAdapter: () => new kysely.PostgresAdapter(),
					createDriver: () => new kysely.DummyDriver(),
					createIntrospector: (db: any) => new kysely.PostgresIntrospector(db),
					createQueryCompiler: () => new kysely.PostgresQueryCompiler(),
				}
			});
		}

		throw new Error(`Driver is not integrated yet: ${driverName}`);
	}
}
