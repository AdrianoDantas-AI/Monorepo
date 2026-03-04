import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.argv[2];

if (!rootDir) {
  console.error("[run-tests] usage: node scripts/testing/run-tests.mjs <dir>");
  process.exit(1);
}

const collectTestFiles = (startDir) => {
  const stack = [startDir];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current);

    for (const entry of entries) {
      const fullPath = resolve(current, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (fullPath.endsWith(".test.ts")) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
};

if (!existsSync(rootDir)) {
  console.error(`[run-tests] dir not found: ${rootDir}`);
  process.exit(1);
}

const testFiles = collectTestFiles(rootDir);
if (testFiles.length === 0) {
  console.error(`[run-tests] no .test.ts files found in ${rootDir}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--import", "tsx", "--test", ...testFiles], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
