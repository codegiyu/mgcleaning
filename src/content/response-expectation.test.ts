import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const SRC = join(import.meta.dirname, "..");
const RETIRED_PROMISES = [/business day/i];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

test("no page repeats a retired response promise", () => {
  const offenders = sourceFiles(SRC).filter((file) => RETIRED_PROMISES.some((pattern) => pattern.test(readFileSync(file, "utf8"))));
  assert.deepEqual(offenders, [], "use src/content/response-expectation.ts instead");
});
