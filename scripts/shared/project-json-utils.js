import fs from "fs";
import path from "path";

export function readJson(projectDir, fileName) {
    const filePath = path.join(projectDir, fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error(`${fileName} not found: ${filePath}`);
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(projectDir, fileName, json) {
    const filePath = path.join(projectDir, fileName);
    fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}