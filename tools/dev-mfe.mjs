#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const shellManifest = resolve(root, 'apps/shell/src/assets/mfe.manifest.local.json');
const requested = process.argv.slice(2).flatMap((arg) => arg.replace(/^--apps=?/, '').split(',')).filter(Boolean);
const supported = new Set(['expenses']);
const localApps = requested.length ? requested : ['expenses'];
const invalid = localApps.filter((name) => !supported.has(name));
if (invalid.length) {
  console.error(`Unsupported local MFE(s): ${invalid.join(', ')}. Supported: ${[...supported].join(', ')}`);
  process.exit(1);
}

const ports = { expenses: 4201 };
execFileSync('pnpm', ['--filter', '@fintrack/shared', 'build'], { cwd: root, stdio: 'inherit' });
const base = JSON.parse(readFileSync(resolve(root, 'apps/shell/src/assets/mfe.manifest.json'), 'utf8'));
const override = { version: base.version, remotes: Object.fromEntries(localApps.map((name) => [name, { url: `http://localhost:${ports[name]}/remoteEntry.json` }])) };
writeFileSync(shellManifest, `${JSON.stringify(override, null, 2)}\n`);

const children = [];
const run = (workspace, script, args = []) => {
  const child = spawn('pnpm', ['--filter', workspace, script, ...args], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  children.push(child);
  return child;
};

run('@fintrack/api', 'dev');
for (const name of localApps) run(`@fintrack/${name}`, 'dev');
run('@fintrack/shell', 'dev');

const cleanup = () => {
  if (existsSync(shellManifest)) unlinkSync(shellManifest);
  for (const child of children) child.kill('SIGTERM');
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => { if (existsSync(shellManifest)) unlinkSync(shellManifest); });
