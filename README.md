# WOW AI Tool

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

Create a `.env` file in the project root with the following keys and add the
exact same values in Vercel → **Project → Settings → Environment Variables**:

```bash
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...

SUPABASE_SERVICE_KEY=...
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
GROK_API_KEY=...
```

Without these variables the build will fail. In particular, omitting
`SUPABASE_SERVICE_KEY` results in a Zod error during the Vercel build.

## Features

- `/` Submit a YouTube link and get a summarised transcript.
- `/history` View previous summaries with pagination.
- `/aggregate` Combine the latest summaries into one overview.
- `/chat` Converse with the LLM. All messages are stored in the `conversations`
  and `messages` tables so you can revisit them later.

Ingestion and chat use **Grok 3 Mini** by default and fall back to OpenAI if
needed. Aggregate summaries are generated with OpenAI’s GPT‑4o model.
