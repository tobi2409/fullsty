function readServerPackageJson(projectDir) {
    const filePath = path.join(projectDir, "server-package.json");

    if (!fs.existsSync(filePath)) {
        throw new Error(`server-package.json not found: ${filePath}`);
    }

    return {
        filePath,
        json: JSON.parse(fs.readFileSync(filePath, "utf8")),
    };
}

function writeServerPackageJson(filePath, json) {
    fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}

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
    const { filePath, json } = readServerPackageJson(projectDir);

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

    writeServerPackageJson(filePath, json);
}

export function handleRemove(projectDir, scriptDir, serverDir, packageNames) {
    const { filePath, json } = readServerPackageJson(projectDir);

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

    writeServerPackageJson(filePath, json);
}