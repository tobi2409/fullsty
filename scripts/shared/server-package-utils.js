import fs, { write } from "fs";
import path from "path";
import { copyDirectory } from "./file-copy.js";
import { readJson, writeJson } from "./project-json-utils.js";

function wrapperDirFromPackage(scriptDir, packageName) {
    return path.join(scriptDir, "extension-wrappers", packageName);
}

function removeWrapperFiles(sourceWrapperDir, targetServerDir) {
    const entries = fs.readdirSync(sourceWrapperDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(sourceWrapperDir, entry.name);
        const targetPath = path.join(targetServerDir, entry.name);

        if (entry.isDirectory()) {
            if (fs.existsSync(targetPath)) {
                removeWrapperFiles(sourcePath, targetPath);
            }

            continue;
        }

        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { force: true });
        }
    }
}

export function handleAdd(projectDir, scriptDir, serverDir, packageNames) {
    const json = readJson(projectDir, "server-package.json");

    if (!json.dependencies || typeof json.dependencies !== "object") {
        json.dependencies = {};
    }

    for (const packageName of packageNames) {
        const wrapperDir = wrapperDirFromPackage(scriptDir, packageName);

        json.dependencies[packageName] = "latest";

        if (fs.existsSync(wrapperDir)) {
            copyDirectory(wrapperDir, serverDir);
            console.log(`\n✅ Copied wrapper for ${packageName} to src/server`);
        }
    }

    writeJson(projectDir, "server-package.json", json);
}

export function handleRemove(projectDir, scriptDir, serverDir, packageNames) {
    const json = readJson(projectDir, "server-package.json");

    if (!json.dependencies || typeof json.dependencies !== "object") {
        json.dependencies = {};
    }

    if (!json.devDependencies || typeof json.devDependencies !== "object") {
        json.devDependencies = {};
    }

    for (const packageName of packageNames) {
        const wrapperDir = wrapperDirFromPackage(scriptDir, packageName);

        delete json.dependencies[packageName];
        delete json.devDependencies[packageName];

        if (fs.existsSync(wrapperDir)) {
            removeWrapperFiles(wrapperDir, serverDir);
            
            console.log(
                `\n✅ Removed wrapper for ${packageName} from src/server`,
            );
        }
    }

    writeJson(projectDir, "server-package.json", json);
}