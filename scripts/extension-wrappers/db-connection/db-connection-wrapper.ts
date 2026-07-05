type DriverName = "pg" | "mysql" | "sqlite";

interface ConnectionData {
    connectionName?: string;
};

export class DbConnection {
    private connectionWrapper?: unknown;

    constructor(
        private readonly driverName: DriverName,
        private readonly connectionData: ConnectionData = {}
    ) {}

    getDriverName(): DriverName {
        return this.driverName;
    }

    async getConnection(): Promise<unknown> {
        if (this.driverName === "pg") {
            if (!this.connectionWrapper) {
                // @ts-ignore pg-wrapper is supplied by the pg extension in generated projects.
                const { PgConnectionWrapper } = await import("../pg/pg-wrapper.ts");
                this.connectionWrapper = new PgConnectionWrapper(this.connectionData.connectionName ?? "default");
            }

            return (this.connectionWrapper as any).getPgPool();
        }

        throw new Error(`Driver is not integrated yet: ${this.driverName}`);
    }

    async close(): Promise<void> {
        if (this.driverName === "pg") {
            if (this.connectionWrapper) {
                await (this.connectionWrapper as any).closePool();
            }

            return;
        }

        throw new Error(`Driver is not integrated yet: ${this.driverName}`);
    }
}
