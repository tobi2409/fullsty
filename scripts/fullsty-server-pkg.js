#!/usr/bin/env node

import path from "path";
import { handleAdd, handleRemove } from "./shared/server-package-utils.js";

function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(
            "Usage: node fullsty-server-pkg.js <add|remove> <package-name> [more-package-names...]",
        );
        
        process.exit(1);
    }

    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    const projectDir = process.cwd();
    const serverDir = path.join(projectDir, "src", "server");
    const packageNames = args.slice(1).filter((arg) => !arg.startsWith("-"));

    if (packageNames.length === 0 || !["add", "remove"].includes(command)) {
        console.log(
            "Usage: node fullsty-server-pkg.js <add|remove> <package-name> [more-package-names...]",
        );

        process.exit(1);
    }

    if (command === "add") {
        handleAdd(projectDir, scriptDir, serverDir, packageNames);
        return;
    }

    handleRemove(projectDir, scriptDir, serverDir, packageNames);
}

try {
    main();
} catch (error) {
    console.error(
        `\n❌ ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
}