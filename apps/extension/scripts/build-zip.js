import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const zipFile = resolve(process.cwd(), 'varia-extension.zip');

if (!existsSync(distDir)) {
  console.error('[Build-Zip] dist directory does not exist. Run "pnpm build" first.');
  process.exit(1);
}

if (existsSync(zipFile)) {
  rmSync(zipFile);
}

try {
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFile}' -Force"`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`cd '${distDir}' && zip -r '${zipFile}' .`, {
      stdio: 'inherit',
    });
  }
  console.log(`\n🎉 Successfully generated Chrome Web Store package: ${zipFile}\n`);
} catch (err) {
  console.error('[Build-Zip] Failed to create zip package:', err);
  process.exit(1);
}
