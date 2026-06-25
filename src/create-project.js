#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// Update package.json name in the copied project frame.
function updatePackageName(targetProjectDir, projectName) {
    const packageJsonPath = path.join(targetProjectDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.name = projectName;

    fs.writeFileSync(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`,
        "utf8",
    );
}

function main() {
    const projectName = process.argv[2];

    if (!projectName) {
        console.error("Usage: node create-project.js <project-name>");
        process.exit(1);
    }

    const scriptDir = __dirname;
    const sourceFrameDir = path.join(scriptDir, "project-frame");
    const targetProjectDir = path.resolve(process.cwd(), projectName);

    if (!fs.existsSync(sourceFrameDir)) {
        throw new Error(`project-frame not found: ${sourceFrameDir}`);
    }

    if (fs.existsSync(targetProjectDir)) {
        throw new Error(`Target directory already exists: ${targetProjectDir}`);
    }

    copyDirectory(sourceFrameDir, targetProjectDir);
    updatePackageName(targetProjectDir, projectName);

    const modulesDir = path.join(targetProjectDir, "modules");
    fs.mkdirSync(modulesDir, { recursive: true });

    const packageNames = [
        "@tobi2409/template-engine",
        "@tobi2409/layout",
        "@tobi2409/proc2rest",
    ];

    handleAdd(targetProjectDir, scriptDir, path.join(targetProjectDir, "src", "server"), packageNames);

    console.log(`\n✅ Project created: ${targetProjectDir}`);
}

try {
    main();
} catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
}
