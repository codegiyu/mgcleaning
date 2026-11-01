// Runs the production build locally the way the Docker image does. `next start` does
// not work with `output: "standalone"`, and the standalone server needs `public` and
// `.next/static` copied next to it (the Dockerfile does the same copy).
import { spawn } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
if (!existsSync(join(standalone, "server.js"))) {
  console.error("No standalone build found. Run `npm run build` first.");
  process.exit(1);
}
cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), { recursive: true });

const server = spawn(process.execPath, ["server.js"], { cwd: standalone, stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
