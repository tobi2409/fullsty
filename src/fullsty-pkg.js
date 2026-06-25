#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(
            "Usage: node fullsty-pkg.js <add|remove> <package-name> [more-package-names...]",
        );
        process.exit(1);
    }

    const scriptDir = __dirname;
    const projectDir = process.cwd();
    const serverDir = path.join(projectDir, "src", "server");
    const packageNames = args.slice(1).filter((arg) => !arg.startsWith("-"));

    if (packageNames.length === 0 || !["add", "remove"].includes(command)) {
        console.log(
            "Usage: node fullsty-pkg.js <add|remove> <package-name> [more-package-names...]",
        );
        process.exit(1);
    }

    if (command === "add") {
        await handleAdd(projectDir, scriptDir, serverDir, packageNames);
        return;
    }

    await handleRemove(projectDir, scriptDir, serverDir, packageNames);
}

main().catch((error) => {
    console.error(
        `\n❌ ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
});
