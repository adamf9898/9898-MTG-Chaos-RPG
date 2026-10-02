import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const childScript = fileURLToPath(new URL('./hang.js', import.meta.url));
spawn(process.execPath, [childScript], { stdio: 'inherit' });
process.on('SIGTERM', () => {});
setInterval(() => {}, 1000);
