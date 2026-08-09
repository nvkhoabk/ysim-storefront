import { spawn } from "node:child_process";

const hostname = "127.0.0.1";
const port = Number(process.env.YSIM_LOCAL_AUDIT_PORT || 4107);
const baseUrl = `http://${hostname}:${port}`;
const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url);
const auditScript = new URL(
  "./audit-f07-prd-002f-ui-locale-runtime.mjs",
  import.meta.url,
);

function run(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    ...options,
  });
}

async function waitUntilReady() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("LOCAL_RUNTIME_AUDIT_SERVER_NOT_READY");
}

const server = run(
  process.execPath,
  [nextBin.pathname, "start", "--hostname", hostname, "--port", String(port)],
  { env: process.env },
);

let exitCode = 1;
try {
  await waitUntilReady();
  const audit = run(
    process.execPath,
    [auditScript.pathname, `--base-url=${baseUrl}`],
    { env: process.env },
  );
  exitCode = await new Promise((resolve) => audit.once("exit", resolve));
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 2_000);
  });
}

process.exitCode = Number.isInteger(exitCode) ? exitCode : 1;
