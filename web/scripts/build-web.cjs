const { spawn } = require('child_process');

const isDev = process.argv.includes('--dev');
const command = isDev ? 'vite' : 'vite build';

const env = {
  ...process.env,
  BUILD_TARGET: 'web',
  VITE_TARGET: 'web'
};

const child = spawn(command, {
  stdio: 'inherit',
  shell: true,
  env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
