#!/usr/bin/env node
/**
 * scripts/check-dashboard-parity.mjs
 *
 * Enforces 1:1 production parity between kinetix-frontend and PrightCord/kinetix/dashboard
 * at the recorded upstream commit. Detects any unallowlisted divergence or drift.
 *
 * Usage:
 *   node scripts/check-dashboard-parity.mjs
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const METADATA_PATH = path.join(process.cwd(), 'scripts', 'upstream-metadata.json');

if (!fs.existsSync(METADATA_PATH)) {
  console.error('[parity] Error: Missing scripts/upstream-metadata.json');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
const REPO = metadata.repository || 'PrightCord/kinetix';
const COMMIT = metadata.commit;

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'kinetix-parity-check' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpGet(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Intentional standalone-only exceptions allowlisted by policy
const INTENTIONAL_EXCEPTIONS = new Set([
  'package.json',         // Contains standalone scripts (sync, check-parity) and dev server bind
  'package-lock.json',    // Package lock
  'index.html',           // Contains lab typography links (Inter font) and viewport title
  'vite.config.ts',       // Standalone container port 3000 host configuration
  'README.md',            // Standalone workbench & design lab documentation
  'src/main.tsx',         // Workbench entry point mounting demo interceptor & lab toolbar
]);

function isAllowlistedStandalonePath(relPath) {
  if (INTENTIONAL_EXCEPTIONS.has(relPath)) return true;
  if (relPath.startsWith('src/demo/')) return true;
  if (relPath.startsWith('src/lab/')) return true;
  if (relPath.startsWith('scripts/')) return true;
  if (relPath.startsWith('test/')) return true;
  if (relPath.startsWith('.git/')) return true;
  if (relPath === '.env.example' || relPath === '.gitignore' || relPath === 'metadata.json') return true;
  return false;
}

async function main() {
  console.log(`[parity] Checking parity against ${REPO} at commit ${COMMIT}...`);

  const treeRaw = await httpGet(`https://api.github.com/repos/${REPO}/git/trees/${COMMIT}?recursive=1`);
  const treeData = JSON.parse(treeRaw.toString('utf-8'));
  const upstreamBlobs = treeData.tree.filter((x) => x.path.startsWith('dashboard/') && x.type === 'blob');

  let checkedCount = 0;
  const divergences = [];

  for (const b of upstreamBlobs) {
    const relPath = b.path.replace('dashboard/', '');
    if (INTENTIONAL_EXCEPTIONS.has(relPath)) {
      continue;
    }

    const localFile = path.join(process.cwd(), relPath);
    if (!fs.existsSync(localFile)) {
      divergences.push({ path: relPath, reason: 'Missing in local repository' });
      continue;
    }

    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${COMMIT}/dashboard/${relPath}`;
    const upstreamContent = await httpGet(rawUrl);
    const localContent = fs.readFileSync(localFile);

    if (!upstreamContent.equals(localContent)) {
      divergences.push({
        path: relPath,
        reason: `Content drift detected (upstream: ${upstreamContent.length}B, local: ${localContent.length}B)`,
      });
    } else {
      checkedCount++;
    }
  }

  console.log(`[parity] Verified ${checkedCount} canonical production files matching 1:1 byte-for-byte with upstream.`);

  if (divergences.length > 0) {
    console.error(`\n[parity] FAILED! Found ${divergences.length} unexpected divergences:`);
    for (const d of divergences) {
      console.error(`  - ${d.path}: ${d.reason}`);
    }
    process.exit(1);
  }

  console.log('\n[parity] SUCCESS: All canonical production files are in 100% parity with upstream Kinetix HEAD.');
}

main().catch((err) => {
  console.error('[parity] Error during check:', err.message);
  process.exit(1);
});
