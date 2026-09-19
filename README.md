<div align="center">

# Kinetix Frontend (UI workbench)

</div>

This is the **standalone React UI workbench** for the [Kinetix](../kinetix) multi-protocol
LLM proxy. It is where the dashboard's look-and-feel is developed against **demo data**, so
you can iterate on the interface without running the proxy or a database.

> The production dashboard that ships embedded in the `kinetix` binary lives in
> [`../kinetix/dashboard`](../kinetix/dashboard) and talks to the **real** admin API (no mock
> data). When you land a UI change here, port the changed components into `kinetix/dashboard`.

## What's here

- The full hand-drawn dashboard: Virtual Keys, Routes & Fallback, Upstream Providers,
  Accounts & Pools, Usage & Spend, Request Inspector, Model Aliases, Audit Log.
- A light/dark/system theme system driven entirely by CSS variables (`src/index.css`) plus a
  `useTheme()` hook (`src/lib/theme.ts`) and a three-way toggle in the top bar.
- A Live Proxy Interactive Tester modal.
- **Demo data** in `src/data/mockData.ts` (seeded providers, models, routes, aliases, keys,
  usage rows, audit entries, metrics) so every screen is populated out of the box.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production bundle in dist/
npm run lint       # tsc --noEmit
```

## Working on the UI

- **Views** live in `src/components/views/`; shared hand-drawn primitives (cards, buttons,
  badges, tape/thumbtack decorations) in `src/components/HandDrawnElements.tsx`.
- **Theme**: all colors are CSS variables (`--paper`, `--ink`, `--surface`, `--marker-red`,
  `--pen-blue`, …) defined in `src/index.css` with a `.dark` override block. Prefer
  `bg-[var(--surface)]` / `text-[var(--ink)]` style classes over hardcoded hexes so both
  themes stay correct.
- **Types** are in `src/types.ts`; **demo data** in `src/data/mockData.ts`.

## Porting a change into the real dashboard

1. Copy the edited component(s) into `../kinetix/dashboard/src/...`.
2. If the change is data-driven, also update `../kinetix/dashboard/src/lib/mappers.ts`
   (snake_case API JSON → camelCase view model) and `src/lib/resources.ts` (the typed client
   over `/admin/api/*`).
3. Rebuild the embedded bundle:
   ```bash
   cd ../kinetix && scripts/build-dashboard.sh    # or: (cd dashboard && npm run build) && touch src/assets.rs && cargo build --release
   ```
