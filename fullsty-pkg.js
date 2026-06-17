#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function wrapperDirFromPackage(scriptDir, packageName) {
  return path.join(scriptDir, 'extension-wrappers', packageName)
}

function copyDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath)
    } else {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

function removeWrapperFiles(sourceWrapperDir, targetServerDir) {
  const entries = fs.readdirSync(sourceWrapperDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceWrapperDir, entry.name)
    const targetPath = path.join(targetServerDir, entry.name)

    if (entry.isDirectory()) {
      if (fs.existsSync(targetPath)) {
        removeWrapperFiles(sourcePath, targetPath)
      }
      continue
    }

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true })
    }
  }
}

function readServerPackageJson(projectDir) {
  const filePath = path.join(projectDir, 'server-package.json')

  if (!fs.existsSync(filePath)) {
    throw new Error(`server-package.json not found: ${filePath}`)
  }

  return {
    filePath,
    json: JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
}

function writeServerPackageJson(filePath, json) {
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
}

async function handleAdd(projectDir, scriptDir, serverDir, packageNames) {
  const { filePath, json } = readServerPackageJson(projectDir)

  if (!json.dependencies || typeof json.dependencies !== 'object') {
    json.dependencies = {}
  }

  for (const packageName of packageNames) {
    const wrapperDir = wrapperDirFromPackage(scriptDir, packageName)

    json.dependencies[packageName] = 'latest'

    if (fs.existsSync(wrapperDir)) {
      copyDir(wrapperDir, serverDir)
      console.log(`\n✅ Copied wrapper for ${packageName} to src/server`)
    }
  }

  writeServerPackageJson(filePath, json)
}

function handleRemove(projectDir, scriptDir, serverDir, packageNames) {
  const { filePath, json } = readServerPackageJson(projectDir)

  if (!json.dependencies || typeof json.dependencies !== 'object') {
    json.dependencies = {}
  }

  if (!json.devDependencies || typeof json.devDependencies !== 'object') {
    json.devDependencies = {}
  }

  for (const packageName of packageNames) {
    const wrapperDir = wrapperDirFromPackage(scriptDir, packageName)

    delete json.dependencies[packageName]
    delete json.devDependencies[packageName]

    if (fs.existsSync(wrapperDir)) {
      removeWrapperFiles(wrapperDir, serverDir)
      console.log(`\n✅ Removed wrapper for ${packageName} from src/server`)
    }
  }

  writeServerPackageJson(filePath, json)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log('Usage: node fullsty-pkg.js <add|remove> <package-name> [more-package-names...]')
    process.exit(1)
  }

  const scriptDir = __dirname
  const projectDir = process.cwd()
  const serverDir = path.join(projectDir, 'src', 'server')
  const packageNames = args.slice(1).filter((arg) => !arg.startsWith('-'))

  if (packageNames.length === 0 || !['add', 'remove'].includes(command)) {
    console.log('Usage: node fullsty-pkg.js <add|remove> <package-name> [more-package-names...]')
    process.exit(1)
  }

  if (command === 'add') {
    await handleAdd(projectDir, scriptDir, serverDir, packageNames)
    return
  }

  await handleRemove(projectDir, scriptDir, serverDir, packageNames)
}

main().catch((error) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
