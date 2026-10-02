import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess, runQualityAudit } from '../tools/quality-audit.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'quality-audit');
const temporaryDirectories = [];

after(async () => {
    await Promise.all(temporaryDirectories.map((directory) => rm(directory, { recursive: true })));
});

async function createReportDirectory() {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'quality-audit-'));
    temporaryDirectories.push(directory);
    return directory;
}

test('runs commands with separate arguments and preserves their exit status', async () => {
    const payload = 'text; this is data, not a shell command';
    const result = await runProcess(
        process.execPath,
        [path.join(FIXTURES, 'echo-args.js'), payload],
        { cwd: ROOT, timeoutMs: 2000 }
    );

    assert.equal(result.exitCode, 0);
    assert.equal(result.timedOut, false);
    assert.deepEqual(JSON.parse(result.stdout), [payload]);
});

test('reports nonzero exits and kills timed-out checks', async () => {
    const failed = await runProcess(process.execPath, [path.join(FIXTURES, 'fail.js')], {
        cwd: ROOT,
        timeoutMs: 2000,
    });
    const timedOut = await runProcess(process.execPath, [path.join(FIXTURES, 'hang.js')], {
        cwd: ROOT,
        timeoutMs: 100,
    });

    assert.equal(failed.exitCode, 7);
    assert.match(failed.stderr, /fixture failure/);
    assert.equal(timedOut.timedOut, true);
    assert.notEqual(timedOut.exitCode, 0);
});

test('writes machine-readable and human-readable reports on check failure', async () => {
    const reportDir = await createReportDirectory();
    const report = await runQualityAudit({
        projectRoot: ROOT,
        reportDir,
        timeoutMs: 2000,
        checks: [
            {
                name: 'Fixture pass',
                command: process.execPath,
                args: [path.join(FIXTURES, 'echo-args.js'), 'ok'],
            },
            {
                name: 'Fixture failure',
                command: process.execPath,
                args: [path.join(FIXTURES, 'fail.js')],
            },
        ],
    });
    const jsonReport = JSON.parse(await readFile(path.join(reportDir, 'quality-audit.json')));
    const markdownReport = await readFile(path.join(reportDir, 'quality-audit.md'), 'utf8');

    assert.equal(report.status, 'failed');
    assert.equal(jsonReport.checks[0].status, 'passed');
    assert.equal(jsonReport.checks[1].exitCode, 7);
    assert.equal(jsonReport.checks[1].status, 'failed');
    assert.match(markdownReport, /Fixture failure/);
    assert.match(markdownReport, /Investigate Fixture failure output/);
});

test('reports missing configured project assets', async () => {
    const projectRoot = await createReportDirectory();
    const reportDir = await createReportDirectory();
    const report = await runQualityAudit({
        projectRoot,
        reportDir,
        checks: [
            {
                name: 'Fixture pass',
                command: process.execPath,
                args: [path.join(FIXTURES, 'echo-args.js'), 'ok'],
            },
        ],
    });

    assert.equal(report.status, 'failed');
    assert.equal(report.checks[0].name, 'Project assets');
    assert.match(report.findings[0], /Missing required project asset/);
});
