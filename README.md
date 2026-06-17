# fullsty

Fullsty is a modular fullstack framework starter built from three core parts:

- `template-engine` for reactive UI rendering
- `layout` for lightweight CSS layout composition
- `proc2rest` for generating REST server/client code from TypeScript server functions

This repository provides a project template and scaffolding script so you can create a new project, generate API/client artifacts, and run the generated server quickly.

Minimal Fullsty starter workflow.

## 1) Create a project

From the repository root:

```bash
./create-project.js projects/demo1
```

This creates a new folder (for example [projects/demo1](projects/demo1)).

## 2) Install project dependencies

Go to the created project and install dependencies:

```bash
cd projects/demo1
npm install
```

## 3) Generate server/client output

Still inside the project folder:

```bash
npm run generate
```

This runs:

- `generate-server` (creates server output in [projects/demo1/generated/server](projects/demo1/generated/server))
- `generate-client` (creates client output in [projects/demo1/generated/client](projects/demo1/generated/client))

It also copies [project-frame/server-config/package.json](project-frame/server-config/package.json) to `generated/server/package.json`.

## 4) Use `fullsty-pkg` for wrapper packages

`fullsty-pkg.js` is a small project helper for wrapper-aware package changes.

Run it from the project root, for example:

```bash
../../fullsty-pkg.js add knex
../../fullsty-pkg.js remove knex
```

What it does:

- `add <package>`
	- adds the package to [project-frame/server-package.json](project-frame/server-package.json)
	- copies a matching wrapper from [extension-wrappers](extension-wrappers) into [projects/demo1/src/server](projects/demo1/src/server)
- `remove <package>`
	- removes the package from [project-frame/server-package.json](project-frame/server-package.json)
	- removes the matching wrapper from [projects/demo1/src/server](projects/demo1/src/server)

The script does not manage the project-level [package.json](project-frame/package.json).

After `fullsty-pkg.js add <package>` you should run `npm run generate` again so the updated [project-frame/server-package.json](project-frame/server-package.json) is copied into `generated/server/package.json`. After that, run `npm install` again inside [projects/demo1/generated/server](projects/demo1/generated/server) so the generated server gets the updated dependencies.

Packages without an extension wrapper, such as `pg`, can also be added with `fullsty-pkg.js`. In that case the script only updates [project-frame/server-package.json](project-frame/server-package.json).

## 5) Start the generated server

Move to the generated server folder and install/start it:

```bash
cd generated/server
npm install
npm run start
```

## package.json responsibilities

- Project-level package file: [project-frame/package.json](project-frame/package.json)
	- Used for generation tasks (`generate-server`, `generate-client`, `generate`).
- Generated server package file: [project-frame/server-package.json](project-frame/server-package.json)
	- Becomes `generated/server/package.json`.
	- Used to run the generated server (`npm run start`).

## Quick summary

1. `node create-project.js projects/<project-name>`
2. `cd projects/<project-name>`
3. `npm install`
4. `npm run generate`
5. `cd generated/server && npm install && npm run start`
