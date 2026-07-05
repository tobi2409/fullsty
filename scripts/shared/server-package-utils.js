import fs from "fs";
import path from "path";
import { copyDirectory } from "./file-copy.js";
import { readJson, writeJson } from "./project-json-utils.js";

const EXTENSION_CONFIG_FILE = "extension.json";

function wrapperDirFromPackage(scriptDir, packageName) {
    return path.join(scriptDir, "extension-wrappers", packageName);
}

function shouldAddToServerPackage(wrapperDir) {
    const extensionConfig = readJson(wrapperDir, EXTENSION_CONFIG_FILE);
    return extensionConfig.addToServerPackage;
}

export function handleAdd(projectDir, scriptDir, serverDir, packageNames) {
    const json = readJson(projectDir, "server-package.json");

    if (!json.dependencies || typeof json.dependencies !== "object") {
        json.dependencies = {};
    }

    for (const packageName of packageNames) {
        const wrapperDir = wrapperDirFromPackage(scriptDir, packageName);
        const targetWrapperDir = path.join(serverDir, packageName);
        const wrapperExists = fs.existsSync(wrapperDir);

        if (!wrapperExists) {
            json.dependencies[packageName] = "latest";
            continue;
        }

        if (shouldAddToServerPackage(wrapperDir)) {
            json.dependencies[packageName] = "latest";
        }

        copyDirectory(wrapperDir, targetWrapperDir, {
            excludedNames: [EXTENSION_CONFIG_FILE],
        });
        console.log(`\n✅ Copied wrapper for ${packageName} to src/server/${packageName}`);
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
        const targetWrapperDir = path.join(serverDir, packageName);
        const wrapperExists = fs.existsSync(wrapperDir);

        if (!wrapperExists) {
            delete json.dependencies[packageName];
            delete json.devDependencies[packageName];
            continue;
        }

        if (shouldAddToServerPackage(wrapperDir)) {
            delete json.dependencies[packageName];
            delete json.devDependencies[packageName];
        }

        if (fs.existsSync(targetWrapperDir)) {
            fs.rmSync(targetWrapperDir, { recursive: true, force: true });

            console.log(
                `\n✅ Removed wrapper for ${packageName} from src/server/${packageName}`,
            );
        }
    }

    writeJson(projectDir, "server-package.json", json);
}