#!/usr/bin/env node
/**
 * src/league/leagueRollover.js
 *
 * CLI script for the nightly GitHub Actions league rollover.
 * Reads data/league/season-N.json, updates standings, and writes back.
 *
 * Usage (in GitHub Actions):
 *   node src/league/leagueRollover.js
 *   node src/league/leagueRollover.js --advance  # start a new season
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSeason, calculateStandings } from './leagueState.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data/league');
const advance = process.argv.includes('--advance');

function getSeasonFiles() {
    if (!existsSync(DATA_DIR)) {
        return [];
    }
    return readdirSync(DATA_DIR)
        .filter((f) => f.match(/^season-\d+\.json$/))
        .sort((a, b) => {
            const na = parseInt(a.match(/\d+/)[0], 10);
            const nb = parseInt(b.match(/\d+/)[0], 10);
            return na - nb;
        });
}

function loadSeason(file) {
    return JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

function saveSeason(file, season) {
    writeFileSync(path.join(DATA_DIR, file), `${JSON.stringify(season, null, 2)}\n`, 'utf8');
}

function main() {
    mkdirSync(DATA_DIR, { recursive: true });

    const files = getSeasonFiles();

    // Initialise first season if no data exists
    if (files.length === 0) {
        const season = createSeason(1);
        saveSeason('season-1.json', season);
        console.log('[Rollover] Initialised season 1');
        return;
    }

    const currentFile = files[files.length - 1];
    const season = loadSeason(currentFile);

    // Recalculate standings from match log (idempotent)
    season.standings = calculateStandings(season.matches);
    saveSeason(currentFile, season);
    console.log(
        `[Rollover] Updated standings for season ${season.season} (${season.matches.length} matches)`
    );

    // Print standings summary
    if (season.standings.length > 0) {
        console.log('\n🏆 Current Standings:');
        season.standings.forEach((s, i) => {
            console.log(
                `  ${i + 1}. ${s.player} — ${s.points}pts (${s.wins}W/${s.losses}L/${s.draws}D)`
            );
        });
    }

    // Advance season if requested
    if (advance) {
        season.active = false;
        season.endDate = new Date().toISOString();
        saveSeason(currentFile, season);

        const nextNumber = season.season + 1;
        const newSeason = createSeason(nextNumber);
        saveSeason(`season-${nextNumber}.json`, newSeason);
        console.log(`\n[Rollover] ✅ Advanced to season ${nextNumber}`);
    }
}

main();
