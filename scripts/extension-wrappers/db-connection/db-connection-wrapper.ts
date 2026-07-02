// @ts-ignore pg-wrapper is supplied by the pg extension in generated projects.
import { getPgPool, closeAllPgPools } from "../pg/pg-wrapper";

type DriverName = "pg" | "mysql" | "sqlite";

type ConnectionData = {
    connectionName?: string;
};

export class DbConnection {
    constructor(
        private readonly driverName: DriverName,
        private readonly connectionData: ConnectionData = {},
    ) {}

    connect() {
        if (this.driverName === "pg") {
            return getPgPool(this.connectionData.connectionName ?? "default");
        }

        throw new Error(`Driver is not integrated yet: ${this.driverName}`);
    }

    async close() {
        if (this.driverName === "pg") {
            await closeAllPgPools();
            return;
        }

        throw new Error(`Driver is not integrated yet: ${this.driverName}`);
    }
}
