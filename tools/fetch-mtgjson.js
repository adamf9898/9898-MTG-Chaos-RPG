#!/usr/bin/env node
/**
 * tools/fetch-mtgjson.js
 *
 * Downloads the MTGJSON AtomicCards bulk data file and caches it at
 * data/mtgjson/AtomicCards.json for offline card lookup.
 *
 * Usage:
 *   node tools/fetch-mtgjson.js
 *   node tools/fetch-mtgjson.js --force   # re-download even if cache is fresh
 *
 * Run automatically by `.github/workflows/league-rollover.yml` nightly.
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, 'data', 'mtgjson');
const CACHE_FILE = path.join(CACHE_DIR, 'AtomicCards.json');
const MTGJSON_URL = 'https://mtgjson.com/api/v5/AtomicCards.json';
const MAX_AGE_HOURS = 24;

const force = process.argv.includes('--force');

async function main() {
    mkdirSync(CACHE_DIR, { recursive: true });

    // Skip download if cache is fresh (< MAX_AGE_HOURS old)
    if (!force && existsSync(CACHE_FILE)) {
        const stat = statSync(CACHE_FILE);
        const ageHours = (Date.now() - stat.mtimeMs) / 3600000;
        if (ageHours < MAX_AGE_HOURS) {
            console.log(
                `[fetch-mtgjson] Cache is ${ageHours.toFixed(1)}h old — skipping download (use --force to override)`
            );
            process.exit(0);
        }
    }

    console.log(`[fetch-mtgjson] Downloading AtomicCards from ${MTGJSON_URL} …`);

    const response = await fetch(MTGJSON_URL);
    if (!response.ok) {
        console.error(`[fetch-mtgjson] HTTP ${response.status}: ${response.statusText}`);
        process.exit(1);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
        const mb = (parseInt(contentLength, 10) / 1024 / 1024).toFixed(1);
        console.log(`[fetch-mtgjson] File size: ~${mb} MB`);
    }

    const out = createWriteStream(CACHE_FILE);
    await pipeline(response.body, out);

    const finalSize = (statSync(CACHE_FILE).size / 1024 / 1024).toFixed(1);
    console.log(`[fetch-mtgjson] ✅ Saved to ${CACHE_FILE} (${finalSize} MB)`);
}

main().catch((err) => {
    console.error('[fetch-mtgjson] Fatal error:', err.message);
    process.exit(1);
});
