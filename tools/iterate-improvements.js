#!/usr/bin/env node
/**
 * tools/iterate-improvements.js
 *
 * Daily automated "iterate + improve" routine for the repository.
 *
 * This script powers the `.github/workflows/daily-repo-automation.yml` workflow
 * so that the project can automatically iterate on small, safe improvements
 * every day. It performs three phases:
 *
 *   1. analyze  — gather a lightweight repository snapshot (file counts,
 *                 TODO/FIXME markers, dependency summary).
 *   2. improve  — apply safe, deterministic auto-fixes (Prettier + ESLint).
 *   3. report   — write a timestamped iteration report to reports/generated/.
 *
 * All phases are non-destructive to program logic: only formatting/lint
 * auto-fixes are applied, and any resulting diff is surfaced through the
 * workflow's pull request step.
 *
 * Usage:
 *   node tools/iterate-improvements.js            # analyze + improve + report
 *   node tools/iterate-improvements.js --analyze  # analysis + report only
 *   node tools/iterate-improvements.js --check     # do not apply fixes (dry run)
 *
 * Also exposed via npm scripts: `analyze`, `iterate`, `improve`,
 * `automation:apply`.
 */

import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'generated');

const args = process.argv.slice(2);
const analyzeOnly = args.includes('--analyze');
const checkOnly = args.includes('--check');

/**
 * Run a command, returning its trimmed stdout. Never throws; on failure the
 * provided fallback value is returned so a single flaky step cannot abort the
 * whole daily run.
 * @param {string} cmd Executable to run.
 * @param {string[]} cmdArgs Arguments for the executable.
 * @param {string} [fallback] Value to return if the command fails.
 * @returns {string}
 */
function run(cmd, cmdArgs, fallback = '') {
    try {
        return execFileSync(cmd, cmdArgs, {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        }).trim();
    } catch (error) {
        if (error.stdout) {
            return String(error.stdout).trim();
        }
        return fallback;
    }
}

/**
 * Collect a lightweight snapshot of the repository state.
 * @returns {object}
 */
function analyze() {
    const trackedFiles = run('git', ['ls-files']).split('\n').filter(Boolean);

    const byExtension = {};
    for (const file of trackedFiles) {
        const ext = path.extname(file) || '(none)';
        byExtension[ext] = (byExtension[ext] || 0) + 1;
    }

    const markerMatches = run('git', [
        'grep',
        '-nEI',
        '(TODO|FIXME|HACK|XXX)',
        '--',
        '*.js',
        '*.md',
        '*.css',
        '*.html',
    ])
        .split('\n')
        .filter(Boolean);

    let dependencies = {};
    let devDependencies = {};
    const pkgPath = path.join(ROOT, 'package.json');
    if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        dependencies = pkg.dependencies || {};
        devDependencies = pkg.devDependencies || {};
    }

    return {
        generatedAt: new Date().toISOString(),
        commit: run('git', ['rev-parse', 'HEAD']),
        branch: run('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
        nodeVersion: process.version,
        totalTrackedFiles: trackedFiles.length,
        filesByExtension: byExtension,
        openMarkers: {
            count: markerMatches.length,
            samples: markerMatches.slice(0, 25),
        },
        dependencyCount: Object.keys(dependencies).length,
        devDependencyCount: Object.keys(devDependencies).length,
    };
}

/**
 * Apply safe, deterministic auto-fixes. Skipped in --check / --analyze modes.
 * @returns {string[]} Human-readable summary lines.
 */
function improve() {
    const summary = [];

    if (checkOnly || analyzeOnly) {
        summary.push('Auto-fixes skipped (dry run).');
        return summary;
    }

    // Prettier formatting across supported file types.
    run('npx', [
        'prettier',
        '--write',
        '**/*.{js,json,css,html,md,yml,yaml}',
        '--log-level',
        'warn',
    ]);
    summary.push('Applied Prettier formatting.');

    // ESLint auto-fixable rules on source directories.
    run('npx', ['eslint', 'src/', 'js/', 'tests/', 'tools/', '--ext', '.js', '--fix']);
    summary.push('Applied ESLint auto-fixes.');

    return summary;
}

/**
 * Write the iteration report(s) to disk.
 * @param {object} analysis Result of analyze().
 * @param {string[]} improvements Result of improve().
 */
function report(analysis, improvements) {
    mkdirSync(REPORT_DIR, { recursive: true });

    const changedFiles = run('git', ['status', '--porcelain']).split('\n').filter(Boolean);

    const payload = {
        ...analysis,
        improvements,
        changedFiles: changedFiles.map((line) => line.trim()),
        changedFileCount: changedFiles.length,
    };

    writeFileSync(
        path.join(REPORT_DIR, 'daily-iteration.json'),
        `${JSON.stringify(payload, null, 2)}\n`
    );

    const md = [
        '# Daily Iteration Report',
        '',
        `- Generated: ${analysis.generatedAt}`,
        `- Commit: ${analysis.commit}`,
        `- Branch: ${analysis.branch}`,
        `- Node: ${analysis.nodeVersion}`,
        `- Tracked files: ${analysis.totalTrackedFiles}`,
        `- Open markers (TODO/FIXME/HACK/XXX): ${analysis.openMarkers.count}`,
        `- Dependencies: ${analysis.dependencyCount} (+${analysis.devDependencyCount} dev)`,
        '',
        '## Improvements applied',
        '',
        ...improvements.map((line) => `- ${line}`),
        '',
        '## Files changed this run',
        '',
        changedFiles.length
            ? changedFiles.map((line) => `- \`${line.trim()}\``).join('\n')
            : '- None',
        '',
    ].join('\n');

    writeFileSync(path.join(REPORT_DIR, 'daily-iteration.md'), `${md}\n`);

    // Console summary for the workflow log.
    console.log(md);
}

function main() {
    const analysis = analyze();
    const improvements = improve();
    report(analysis, improvements);
}

main();
