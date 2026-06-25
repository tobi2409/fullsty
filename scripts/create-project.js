#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { copyDirectory } from "./shared/file-copy.js";
import { readJson, writeJson } from "./shared/project-json-utils.js";

// Update package.json name in the copied project frame.
function updatePackageName(targetProjectDir, projectName) {
    const packageJson = readJson(targetProjectDir, "package.json");
    packageJson.name = projectName;
    writeJson(targetProjectDir, "package.json", packageJson);
}

function main() {
    const projectName = process.argv[2];

    if (!projectName) {
        console.error("Usage: node create-project.js <project-name>");
        process.exit(1);
    }

    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
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

    console.log(`\n✅ Project created: ${targetProjectDir}`);
}

try {
    main();
} catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
}
