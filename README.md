# Kinetix Frontend

Standalone UI workbench kept in parity with `PrightCord/kinetix/dashboard`.

## Demo mode

Demo mode is enabled by default and covers every current dashboard surface: keys, routes,
providers, accounts, models, aliases, usage/exports, request inspector, audit, plugins,
settings, model discovery/provider tests, and the live tester.

```bash
cp .env.example .env
npm install
npm run dev
npm run lint
npm run build
```

Set `VITE_KINETIX_DEMO=false` only when serving this frontend against a real Kinetix
instance exposing `/admin/api/*` on the same origin.

Production UI changes should remain synchronized with `PrightCord/kinetix/dashboard`;
standalone-specific behavior belongs in `src/data/mockData.ts` and
`src/lib/demoResources.ts`.
