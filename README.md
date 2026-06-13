# otherix-web

Public web properties for Otherix:

- **otherix.dev** - the marketing homepage (Hugo, this repo, Cloudflare Pages).
- **get.otherix.dev** - the install endpoint (`worker/`, Cloudflare Worker) that transparently serves the canonical installer from `docs.otherix.dev/install.sh`.

`docs.otherix.dev` lives in the product monorepo (`otherix/otherix`, MkDocs on GitHub Pages) and is not built here.

## Local development

```bash
hugo server -D            # http://localhost:1313
cd worker && npx wrangler dev   # the get.otherix.dev worker
```

Hugo is the only build dependency for the site (`brew install hugo`). The site ships zero JavaScript beyond a tiny inline copy-to-clipboard helper.

## Operator runbook (one-time cutover)

### 1. Cloudflare zone

1. Add `otherix.dev` as a zone in Cloudflare.
2. At the registrar, set the nameservers to the Cloudflare-assigned pair.
3. Wait for the zone to go active.

### 2. otherix.dev (apex) on Cloudflare Pages

1. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> connect this repo.
2. Build settings:
   - Framework preset: Hugo
   - Build command: `hugo --minify`
   - Build output directory: `public`
   - Environment variable: `HUGO_VERSION = 0.163.1`
3. After the first deploy, add the custom domain `otherix.dev` to the Pages project (Cloudflare creates the proxied apex record).

### 3. get.otherix.dev worker

1. Create a repo secret `CLOUDFLARE_ACCOUNT_ID` (Cloudflare -> account home).
2. Create a repo secret `CLOUDFLARE_API_TOKEN` with the "Edit Cloudflare Workers" template, scoped to this account.
3. Push to `main` (or re-run the `worker` workflow) to deploy the Worker.
4. In the Worker's settings -> Triggers -> Custom Domains, add `get.otherix.dev`. Cloudflare creates the proxied record and provisions TLS.
5. Verify: `curl -fsSL get.otherix.dev | head -1` prints `#!/bin/sh`.

### 4. docs.otherix.dev (GitHub Pages, from the monorepo)

1. In Cloudflare DNS, add `docs` -> `CNAME` -> `otherix.github.io`, set to **DNS only** (grey cloud) so GitHub Pages terminates TLS itself.
2. In the `otherix/otherix` repo: Settings -> Pages -> Custom domain = `docs.otherix.dev`; wait for the check, then enable **Enforce HTTPS**.
3. Verify: `curl -fsSL https://docs.otherix.dev/install.sh | head -1` prints `#!/bin/sh`.

### Order of operations

Bring up `docs.otherix.dev` (step 4) before relying on `get.otherix.dev` (step 3): the Worker aliases the docs-published script, so the install endpoint only returns 200 once `docs.otherix.dev/install.sh` is live.
