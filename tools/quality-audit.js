import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'generated');
const REPORT_NAME = 'quality-audit';
const CHECK_TIMEOUT_MS = 4 * 60 * 1000;
const MAX_OUTPUT_CHARS = 20000;
const PROJECT_ASSETS = [
    'package.json',
    'package-lock.json',
    'eslint.config.js',
    'tests',
    'src/generators/perchance.js',
    'src/services/cardSource.js',
    '.github/workflows/ci.yml',
];
const npmExecPath = process.env.npm_execpath;
const NPM_EXECUTABLE =
    npmExecPath && path.isAbsolute(npmExecPath) && path.basename(npmExecPath) === 'npm-cli.js'
        ? process.execPath
        : process.platform === 'win32'
          ? 'npm.cmd'
          : 'npm';
const npmArgs = (script) =>
    NPM_EXECUTABLE === process.execPath ? [npmExecPath, 'run', script] : ['run', script];
const CHECKS = [
    { name: 'Lint', command: NPM_EXECUTABLE, args: npmArgs('lint') },
    { name: 'Formatting', command: NPM_EXECUTABLE, args: npmArgs('format:check') },
    { name: 'Tests', command: NPM_EXECUTABLE, args: npmArgs('test') },
];

function appendOutput(current, chunk) {
    return `${current}${chunk}`.slice(-MAX_OUTPUT_CHARS);
}

export function runProcess(command, args, { cwd = ROOT, timeoutMs = CHECK_TIMEOUT_MS } = {}) {
    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        let spawnError = null;
        let timedOut = false;
        let escalationTimer;

        const child = spawn(command, args, {
            cwd,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: process.platform !== 'win32',
            shell: false,
        });

        child.stdout.on('data', (chunk) => {
            stdout = appendOutput(stdout, chunk);
        });
        child.stderr.on('data', (chunk) => {
            stderr = appendOutput(stderr, chunk);
        });
        child.on('error', (error) => {
            spawnError = error;
        });

        const signalProcessTree = (signal) => {
            if (!child.pid) {
                return;
            }
            if (process.platform === 'win32') {
                const args = ['/pid', String(child.pid), '/t'];
                if (signal === 'SIGKILL') {
                    args.push('/f');
                }
                const killer = spawn('taskkill.exe', args, {
                    stdio: 'ignore',
                    windowsHide: true,
                    shell: false,
                });
                killer.on('error', () => child.kill(signal));
                return;
            }
            try {
                process.kill(-child.pid, signal);
            } catch {
                child.kill(signal);
            }
        };

        const timeout = setTimeout(() => {
            timedOut = true;
            signalProcessTree('SIGTERM');
            escalationTimer = setTimeout(() => {
                signalProcessTree('SIGKILL');
            }, 1000);
            escalationTimer.unref();
        }, timeoutMs);

        child.on('close', (exitCode, signal) => {
            clearTimeout(timeout);
            clearTimeout(escalationTimer);
            resolve({
                exitCode: spawnError ? 127 : exitCode,
                signal,
                timedOut,
                error: spawnError?.message ?? null,
                stdout,
                stderr,
            });
        });
    });
}

function actionableTask(check) {
    if (check.name === 'Lint') {
        return 'Fix the reported ESLint errors, then rerun npm run lint.';
    }
    if (check.name === 'Formatting') {
        return 'Format the intended files, review the diff, then rerun npm run format:check.';
    }
    if (check.name === 'Tests') {
        return 'Investigate the first failing test, fix the behavior, then rerun npm test.';
    }
    return `Investigate ${check.name} output, fix the failing check, and rerun npm run verify.`;
}

function renderMarkdown(report) {
    const rows = report.checks
        .map(
            (check) =>
                `| ${check.name} | ${check.status} | ${check.durationMs} ms | ${check.exitCode ?? 'n/a'} |`
        )
        .join('\n');
    const findings = report.findings.length
        ? report.findings.map((finding) => `- ${finding}`).join('\n')
        : '- No findings.';
    const tasks = report.nextTasks.length
        ? report.nextTasks.map((task) => `- ${task}`).join('\n')
        : '- No follow-up tasks from this run.';

    return `# Repository quality audit

- Generated: ${report.generatedAt}
- Result: ${report.status}
- Runtime: Node ${report.runtime.node}, npm ${report.runtime.npm}

## Checks

| Check | Status | Duration | Exit code |
| --- | --- | ---: | ---: |
${rows}

## Findings

${findings}

## Next tasks

${tasks}
`;
}

export async function runQualityAudit({
    projectRoot = ROOT,
    reportDir = REPORT_DIR,
    checks = CHECKS,
    timeoutMs = CHECK_TIMEOUT_MS,
} = {}) {
    const startedAt = Date.now();
    const assetResults = await Promise.all(
        PROJECT_ASSETS.map(async (asset) => {
            try {
                await access(path.join(projectRoot, asset));
                return null;
            } catch {
                return `Missing required project asset: ${asset}`;
            }
        })
    );
    const findings = assetResults.filter(Boolean);
    const results = [];

    for (const check of checks) {
        const checkStartedAt = Date.now();
        const result = await runProcess(check.command, check.args, {
            cwd: projectRoot,
            timeoutMs,
        });
        const status = result.exitCode === 0 && !result.timedOut ? 'passed' : 'failed';
        const details = [result.error, result.stderr, result.stdout]
            .filter(Boolean)
            .join('\n')
            .trim();

        results.push({
            name: check.name,
            status,
            exitCode: result.exitCode,
            signal: result.signal,
            timedOut: result.timedOut,
            durationMs: Date.now() - checkStartedAt,
            output: details.slice(-MAX_OUTPUT_CHARS),
        });
        if (status === 'failed') {
            findings.push(
                `${check.name} ${result.timedOut ? 'timed out' : `failed with exit code ${result.exitCode}`}.`
            );
        }
    }

    const failedChecks = results.filter(({ status }) => status === 'failed');
    const report = {
        generatedAt: new Date().toISOString(),
        status: findings.length === 0 ? 'passed' : 'failed',
        durationMs: Date.now() - startedAt,
        runtime: { node: process.version, npm: process.env.npm_config_user_agent ?? 'unknown' },
        checks: [
            ...(findings.some((finding) => finding.startsWith('Missing required project asset:'))
                ? [
                      {
                          name: 'Project assets',
                          status: 'failed',
                          exitCode: null,
                          durationMs: 0,
                          output: findings
                              .filter((finding) =>
                                  finding.startsWith('Missing required project asset:')
                              )
                              .join('\n'),
                      },
                  ]
                : []),
            ...results,
        ],
        findings,
        nextTasks: [
            ...failedChecks.map(actionableTask),
            ...(findings.some((finding) => finding.startsWith('Missing required project asset:'))
                ? [actionableTask({ name: 'Project assets' })]
                : []),
        ],
    };

    await mkdir(reportDir, { recursive: true });
    await writeFile(
        path.join(reportDir, `${REPORT_NAME}.json`),
        `${JSON.stringify(report, null, 2)}\n`
    );
    await writeFile(path.join(reportDir, `${REPORT_NAME}.md`), renderMarkdown(report));

    return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const report = await runQualityAudit();
        console.log(`Quality audit ${report.status}: ${report.findings.length} finding(s).`);
        console.log(`Reports: ${path.join(REPORT_DIR, `${REPORT_NAME}.json`)} and .md`);
        if (report.status !== 'passed') {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(`Quality audit could not write its reports: ${error.message}`);
        process.exitCode = 1;
    }
}
