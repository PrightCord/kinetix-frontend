#!/usr/bin/env node
/**
 * scripts/sync-dashboard.mjs
 *
 * Deterministically synchronizes canonical production dashboard files from
 * PrightCord/kinetix/dashboard into kinetix-frontend.
 *
 * Usage:
 *   node scripts/sync-dashboard.mjs [--commit <sha>]
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const REPO = 'PrightCord/kinetix';
const DEFAULT_BRANCH = 'main';
const METADATA_PATH = path.join(process.cwd(), 'scripts', 'upstream-metadata.json');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'kinetix-sync-tool' } }, (res) => {
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

async function main() {
  const args = process.argv.slice(2);
  let targetCommit = '';
  const commitIdx = args.indexOf('--commit');
  if (commitIdx !== -1 && args[commitIdx + 1]) {
    targetCommit = args[commitIdx + 1];
  }

  let commitInfo = null;

  if (!targetCommit) {
    console.log(`[sync] Querying latest main HEAD for ${REPO}...`);
    const commitDataRaw = await httpGet(`https://api.github.com/repos/${REPO}/commits/${DEFAULT_BRANCH}`);
    commitInfo = JSON.parse(commitDataRaw.toString('utf-8'));
    targetCommit = commitInfo.sha;
  } else {
    console.log(`[sync] Querying commit details for ${targetCommit}...`);
    const commitDataRaw = await httpGet(`https://api.github.com/repos/${REPO}/commits/${targetCommit}`);
    commitInfo = JSON.parse(commitDataRaw.toString('utf-8'));
  }

  console.log(`[sync] Upstream target commit: ${targetCommit}`);
  console.log(`[sync] Message: ${commitInfo.commit.message.split('\n')[0]}`);

  const treeRaw = await httpGet(`https://api.github.com/repos/${REPO}/git/trees/${targetCommit}?recursive=1`);
  const treeData = JSON.parse(treeRaw.toString('utf-8'));
  const blobs = treeData.tree.filter((x) => x.path.startsWith('dashboard/') && x.type === 'blob');

  console.log(`[sync] Found ${blobs.length} upstream dashboard blobs.`);

  // Canonical files that map directly into src/ or root
  const preservedExceptions = new Set([
    'package.json',
    'index.html',
    'vite.config.ts',
    'README.md',
    'src/main.tsx',
  ]);

  let syncedCount = 0;

  for (const b of blobs) {
    const relPath = b.path.replace('dashboard/', '');
    if (preservedExceptions.has(relPath)) {
      continue;
    }

    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${targetCommit}/dashboard/${relPath}`;
    const content = await httpGet(rawUrl);
    const dest = path.join(process.cwd(), relPath);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    syncedCount++;
  }

  console.log(`[sync] Successfully synchronized ${syncedCount} canonical files into workspace.`);

  // Update metadata
  const metadata = {
    repository: REPO,
    branch: DEFAULT_BRANCH,
    commit: targetCommit,
    commit_message: commitInfo.commit.message.split('\n')[0],
    commit_date: commitInfo.commit.author?.date || commitInfo.commit.committer?.date,
    synced_at: new Date().toISOString(),
    dashboard_path: 'dashboard',
  };

  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2) + '\n');
  console.log(`[sync] Updated ${METADATA_PATH}`);
}

main().catch((err) => {
  console.error('[sync] Error:', err.message);
  process.exit(1);
});
