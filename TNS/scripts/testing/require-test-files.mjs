import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const hasMatchingFile = (rootDir, predicate) => {
  if (!existsSync(rootDir)) {
    return false;
  }

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current);

    for (const entry of entries) {
      const fullPath = join(current, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (predicate(fullPath)) {
        return true;
      }
    }
  }

  return false;
};

const unitOk = hasMatchingFile("tests/unit", (value) => value.endsWith(".test.ts"));
const integrationOk = hasMatchingFile("tests/integration", (value) => value.endsWith(".test.ts"));

if (!unitOk || !integrationOk) {
  const missing = [
    !unitOk ? "unit tests ausentes em tests/unit/**/*.test.ts" : null,
    !integrationOk ? "integration tests ausentes em tests/integration/**/*.test.ts" : null,
  ]
    .filter(Boolean)
    .join("; ");

  console.error(`[test:guard] Falhou: ${missing}`);
  process.exit(1);
}

console.log("[test:guard] OK: unit + integration tests presentes.");
