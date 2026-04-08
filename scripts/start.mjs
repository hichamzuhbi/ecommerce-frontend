import { spawn } from 'node:child_process';

const port = process.env.PORT || '8080';
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(command, ['serve', '-s', 'dist', '-l', port], {
  stdio: 'inherit',
  shell: isWindows,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
