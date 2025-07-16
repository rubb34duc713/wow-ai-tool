# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

This project requires **Node.js 24** or newer. If you use
[nvm](https://github.com/nvm-sh/nvm), run `nvm use` to activate the version
listed in `.nvmrc` before starting the dev server.

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Troubleshooting Node version errors

If the dev server fails with errors like `TypeError: crypto.hash is not a function`, your shell may be picking up an older Node.js release. Ensure that [nvm](https://github.com/nvm-sh/nvm) loads before any Node.js installation from Homebrew:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
export PATH="$NVM_DIR/versions/node/$(nvm version)/bin:$PATH"
```

Reload your shell and verify with `node --version` that you see a 24.x release.


## Troubleshooting missing dependencies

If `npm run lint` or `npm run build` fail with errors like "prettier-plugin-svelte not found" or "vite: command not found", install the project's dependencies:

```bash
npm install
```

Then re-run the command.
