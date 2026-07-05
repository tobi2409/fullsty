// @ts-ignore pg dependencies are supplied by the server package in generated projects.
import dotenv from "dotenv";
// @ts-ignore node types are supplied by the server package in generated projects.
import fs from "fs";
// @ts-ignore node types are supplied by the server package in generated projects.
import path from "path";
// @ts-ignore pg dependencies are supplied by the server package in generated projects.
import { Pool } from "pg";
// @ts-ignore node types are supplied by the server package in generated projects.
import { fileURLToPath } from "url";

export class PgConnectionWrapper {
    private pool: Pool | null = null;
    private pgEnv: Record<string, string> = {};
    private pgEnvLoaded: boolean = false;
    private readonly wrapperDir: string = path.dirname(fileURLToPath(import.meta.url));
    private readonly envFilePath: string = path.join(this.wrapperDir, ".env.pg");

    constructor(private readonly connectionName: string = "default") {}

    private envKey(key: string): string {
        const prefix = this.connectionName.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        return `${prefix}_${key}`;
    }

    private loadPgEnv(): void {
        // only load the .env.pg file once
        if (this.pgEnvLoaded) {
            return;
        }

        // Load .env.pg into a local cache instead of writing into process.env.
        // This keeps the pg wrapper isolated from other wrappers such as auth,
        // which may load their own .env files later.
        const envFileContent = fs.existsSync(this.envFilePath)
            ? fs.readFileSync(this.envFilePath, "utf8")
            : "";

        this.pgEnv = dotenv.parse(envFileContent);
        this.pgEnvLoaded = true;
    }

    private getEnv(key: string, fallback?: string): string {
        this.loadPgEnv();
        return this.pgEnv[this.envKey(key)] ?? fallback ?? "";
    }

    getPgPool(): Pool {
        if (this.pool) {
            return this.pool;
        }

        this.pool = new Pool({
            host: this.getEnv("PGHOST", "127.0.0.1"),
            port: Number(this.getEnv("PGPORT", "5432")),
            user: this.getEnv("PGUSER", "postgres"),
            password: this.getEnv("PGPASSWORD", "postgres"),
            database: this.getEnv("PGDATABASE", "fullsty_demo"),
            max: Number(this.getEnv("POOL_MAX", "10"))
        });

        return this.pool;
    }

    async closePool(): Promise<void> {
        if (!this.pool) {
            return;
        }

        await this.pool.end();
        this.pool = null;
    }
}