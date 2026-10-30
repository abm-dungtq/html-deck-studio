# Deploying for online presenting

Deploy only when the user asks. A deployed deck is **public to anyone with the
link**; say so before the first deploy and name anything sensitive in it
(customer names, prices, internal plans). Proceed once the user accepts.

The default is Vercel because the deck is static and the CLI deploys a folder in
one command. Cloudflare Pages (`npx wrangler pages deploy <dir>`) or GitHub
Pages work the same way if the user prefers them.

## Preconditions

- `vercel --version` works and `vercel whoami` shows the user's account. If not
  logged in, ask the user to run `vercel login` themselves; never handle their
  credentials.
- `.vercelignore` exists in the deck folder (the template ships one). It must
  exclude everything that is not the deck:

```
assets/src
tools
plans
.DS_Store
**/.DS_Store
.claude
.vercel
.gitignore
.vercelignore
```

`.claude` matters: agents may write memory or notes inside the deck folder, and
without this line they are published. Check `ls -la <deck-dir>` for any other
hidden or working folder and add it before deploying.

## Deploy

```bash
cd <deck-dir>
vercel deploy --prod --yes
```

The first run links a project (named after the folder unless the user wants
another name) and prints the production alias, e.g.
`https://<project>.vercel.app`. Later updates are the same command; the alias
stays the same.

## Verify

```bash
<skill-dir>/scripts/check-deploy.sh https://<project>.vercel.app
```

All lines must be `ok`: the deck, CSS, JS and an image return 200; working
files return 404. Then open the URL in a browser and click through one slide.

## If something private was published

1. Add the path to `.vercelignore` and redeploy.
2. Re-run `check-deploy.sh` against the production alias.
3. Older deployments keep their own URLs with the old files. List them with
   `vercel ls <project>`; tell the user which one contains the file and ask
   before `vercel remove <deployment-url> --yes`, since removal cannot be undone.
