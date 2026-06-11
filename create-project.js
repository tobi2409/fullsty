#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

// Recursively copy a directory and all nested files/folders.
function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
    } else {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

// Clone a Git repository into the provided target path.
function cloneRepo(url, targetPath) {
  const result = spawnSync('git', ['clone', '--depth', '1', url, targetPath], {
    stdio: 'inherit'
  })

  if (result.status !== 0) {
    throw new Error(`Could not clone repository: ${url}`)
  }
}

// Update package.json name in the copied project frame.
function updatePackageName(targetProjectDir, projectName) {
  const packageJsonPath = path.join(targetProjectDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = projectName
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
}

function main() {
  const projectName = process.argv[2]

  if (!projectName) {
    console.error('Usage: node create-project.js <project-name>')
    process.exit(1)
  }

  const scriptDir = __dirname
  const sourceFrameDir = path.join(scriptDir, 'project-frame')
  const targetProjectDir = path.resolve(process.cwd(), projectName)

  if (!fs.existsSync(sourceFrameDir)) {
    throw new Error(`project-frame not found: ${sourceFrameDir}`)
  }

  if (fs.existsSync(targetProjectDir)) {
    throw new Error(`Target directory already exists: ${targetProjectDir}`)
  }

  copyDirectory(sourceFrameDir, targetProjectDir)
  updatePackageName(targetProjectDir, projectName)

  const modulesDir = path.join(targetProjectDir, 'modules')
  fs.mkdirSync(modulesDir, { recursive: true })

  const repos = [
    'https://github.com/tobi2409/template-engine.git',
    'https://github.com/tobi2409/layout.git',
    'https://github.com/tobi2409/proc2rest.git'
  ]

  for (const repoUrl of repos) {
    const repoName = path.basename(repoUrl, '.git')
    const repoTargetPath = path.join(modulesDir, repoName)

    if (fs.existsSync(repoTargetPath)) {
      fs.rmSync(repoTargetPath, { recursive: true, force: true })
    }

    cloneRepo(repoUrl, repoTargetPath)
  }

  console.log(`\n✅ Project created: ${targetProjectDir}`)
}

try {
  main()
} catch (error) {
  console.error(`\n❌ ${error.message}`)
  process.exit(1)
}
