import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

test("seed demo em dry-run gera payload reproduzivel", () => {
  const repoRoot = process.cwd();
  const seedScriptPath = path.resolve(repoRoot, "services/api/prisma/seed-demo.ts");

  const result = spawnSync(process.execPath, ["--import", "tsx", seedScriptPath, "--dry-run"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      SEED_DRY_RUN: "1",
    },
  });

  assert.equal(result.status, 0, `Seed dry-run falhou: ${result.stderr}`);
  assert.ok(result.stdout.trim().length > 0, "Seed dry-run nao retornou payload.");

  const payload = JSON.parse(result.stdout) as {
    mode: string;
    summary: {
      trips: number;
      stops: number;
      legs: number;
      routePlans: number;
      routeTracks: number;
      tenants: string[];
      tripIds: string[];
    };
  };

  assert.equal(payload.mode, "dry-run");
  assert.deepEqual(payload.summary, {
    trips: 2,
    stops: 7,
    legs: 5,
    routePlans: 2,
    routeTracks: 2,
    tenants: ["tenant_demo_alpha", "tenant_demo_beta"],
    tripIds: ["trip_demo_rj_001", "trip_demo_sp_001"],
  });
});
