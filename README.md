# fullsty

Fullsty is a modular fullstack framework starter built from three core parts:

- `template-engine` for reactive UI rendering
- `layout` for lightweight CSS layout composition
- `proc2rest` for generating REST server/client code from TypeScript server functions

This repository provides a project template and scaffolding script so you can create a new project, generate API/client artifacts, and run the generated server quickly.

Minimal Fullsty starter workflow.

**It is recommended to install fullsty globally.**

A sample application can be found at https://github.com/tobi2409/fullsty/tree/main/projects/db-test

For the `db-test` demo, add the required server wrappers in your project root before generating/running:

```bash
fullsty-server-pkg add pg
fullsty-server-pkg add db-connection
fullsty-server-pkg add kysely
```

## 1) Create a project

From the repository root:

```bash
create-fullsty-project projects/demo1
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

It also copies [project-frame/server-package.json](project-frame/server-package.json) to `generated/server/package.json` and [project-frame/client-package.json](project-frame/client-package.json) to `generated/client/package.json`.

## 4) Use `fullsty-pkg` for wrapper packages

`fullsty-pkg.js` is a small project helper for wrapper-aware package changes.

Run it from the project root, for example:

```bash
fullsty-server-pkg add pg
fullsty-server-pkg add kysely
fullsty-server-pkg remove pg
```

Alternatively, you can also use `npx fullsty-server-pkg`.

What it does:

- `add <package>`
    - adds the package to the project's server package file, which is initially created from [project-frame/server-package.json](project-frame/server-package.json)
    - copies a matching wrapper from [scripts/extension-wrappers](scripts/extension-wrappers) into [projects/demo1/src/server](projects/demo1/src/server)
- `remove <package>`
    - removes the package from the project's server package file
    - removes the matching wrapper from [projects/demo1/src/server](projects/demo1/src/server)

The script does not manage the project-level [package.json](project-frame/package.json).

After `fullsty-server-pkg.js add <package>` you should run `npm run generate` again so the updated project server package file is copied into `generated/server/package.json`. After that, run `npm install` again inside [projects/demo1/generated/server](projects/demo1/generated/server) so the generated server gets the updated dependencies.

`fullsty-server-pkg.js add kysely` copies [scripts/extension-wrappers/kysely/kysely-wrapper.ts](scripts/extension-wrappers/kysely/kysely-wrapper.ts) into [projects/demo1/src/server](projects/demo1/src/server). This keeps `kysely` visible as the recommended SQL style without coupling it to a specific DBMS wrapper. For PostgreSQL pooling and env handling you can add `pg` separately.

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

## 6) Install client dependencies

Move to the generated client folder and install the dependencies:

```bash
cd generated/client
npm install
```

## VS Code Setup

To prevent Live Server from reloading when server logs are written, add this to `.vscode/settings.json`:

```json
{
    "liveServer.settings.ignoreFiles": [
        "**/generated/server/logs/**",
        "**/*.log"
    ]
}
```

## Quick summary

1. `node create-project.js projects/<project-name>`
2. `cd projects/<project-name>`
3. `npm install`
4. `npm run generate`
5. `cd generated/server && npm install && npm run start`
