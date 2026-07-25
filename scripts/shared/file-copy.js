import fs from 'fs'
import path from 'path'

// Recursively copy a directory and all nested files/folders.
export function copyDirectory(sourceDir, targetDir, options = {}) {
    const excludedNames = new Set(options.excludedNames ?? [])

    fs.mkdirSync(targetDir, { recursive: true })
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true })

    for (const entry of entries) {
        if (excludedNames.has(entry.name)) {
            continue
        }

        const sourcePath = path.join(sourceDir, entry.name)
        const targetPath = path.join(targetDir, entry.name)

        if (entry.isDirectory()) {
            copyDirectory(sourcePath, targetPath, options)
        } else {
            fs.copyFileSync(sourcePath, targetPath)
        }
    }
}
