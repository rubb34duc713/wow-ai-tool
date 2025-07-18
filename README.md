# WOW AI Tool

A SvelteKit app for summarising YouTube videos and chatting with AI.

## Developing

This project uses Node 24.4.1. If you're using [nvm](https://github.com/nvm-sh/nvm), run:

```bash
nvm use
# run `nvm install` first if Node 24.4.1 isn't installed
```

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

**Before running `npm run dev` or any other npm script, be sure you've installed dependencies by running `npm install` (or `pnpm install`, `yarn`).**

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

## Deployment: Vercel

The repo is ready to deploy to Vercel. If an existing Vercel project is linked
to the wrong GitHub repository you can either relink it or remove it:

1. **Relink an existing project**
   - In the project folder run `vercel link` and choose the correct Vercel
     project.
   - Or open the project in the Vercel dashboard → **Settings → Git** and switch
     the connected repository.

2. **Create a new project**
   - Run `vercel` in the project folder and choose **Create a new project** when
     prompted.
   - Or head to the Vercel dashboard, click **New Project**, and import this
     GitHub repository.

3. **Delete an unused project**
   - Visit the project’s dashboard in Vercel.
   - Scroll to **Danger Zone** at the bottom of **Settings** and click
     **Delete**.

Once the project is linked to this repo you can deploy with:

```bash
vercel --prod
```

Make sure your Git remote is pointing at the correct GitHub repository and
push your latest commits before deploying:

```bash
git remote -v      # verify URL
git push origin main
```

Every push to GitHub will then trigger a new deploy automatically.

## Database setup (Supabase)

Open the `supabase_schema.sql` file and copy its contents into the SQL editor of
a new Supabase project. Running the script will create all tables used by the
PRISM pipeline and apply row‑level security. (If you prefer the CLI you can run
`supabase db query < supabase_schema.sql` instead.)

This file ships with the repo and defines tables for transcripts, analysis
results, aggregated summaries, daily snapshots, chat conversations and a secure
`secrets` table. It also creates indexes and row‑level security policies that
limit each user to rows they created (while the service role can access
everything). After running the script you can add the Supabase keys to `.env`
and Vercel as described in the build plan.

## Environment variables

Create a `.env` file in the project root with the following keys. In Vercel,
set at least `SUPABASE_URL` (or `PUBLIC_SUPABASE_URL`) and
`SUPABASE_SERVICE_KEY` so the build can connect to your database. The remaining
API keys may also be stored in the `secrets` table created by
`supabase_schema.sql` and loaded at runtime:

```bash
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...

# or provide SUPABASE_URL for server-only use
SUPABASE_URL=...

SUPABASE_SERVICE_KEY=...
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
GROK_API_KEY=...
```

If a key is not set in the environment the app will attempt to read it from the
`secrets` table. At minimum, Vercel must provide a Supabase URL and service key
or the build will fail with a Zod error.

## Features

- `/` Submit a YouTube link and get a summarised transcript.
- `/history` View previous summaries with pagination.
- `/aggregate` Combine the latest summaries into one overview.
- `/chat` Converse with the LLM. All messages are stored in the `conversations`
  and `messages` tables so you can revisit them later.

Ingestion and chat use **Grok 3 Mini** by default and fall back to OpenAI if
needed. Aggregate summaries are generated with OpenAI’s GPT‑4o model.

## Deployment: Vercel

The repo is ready to deploy to Vercel. If an existing Vercel project is linked
to the wrong GitHub repository you can either relink it or remove it:

1. **Relink an existing project**
   - In the project folder run `vercel link` and choose the correct Vercel
     project.
   - Or open the project in the Vercel dashboard → **Settings → Git** and switch
     the connected repository.

2. **Delete an unused project**
   - Visit the project’s dashboard in Vercel.
   - Scroll to **Danger Zone** at the bottom of **Settings** and click
     **Delete**.

Once the project is linked to this repo you can deploy with:

```bash
vercel --prod
```

Every push to GitHub will then trigger a new deploy automatically.
