// F07-PRD-002N_MARKET_ROUTING_RUNTIME_R1

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const nextBin = path.join(
  repoRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const executionFlags = [
  "PAYMENT_EXECUTION_ENABLED",
  "FULFILLMENT_EXECUTION_ENABLED",
  "CUSTOMER_EMAIL_DELIVERY_ENABLED",
  "SCHEDULER_ENABLED",
  "AGENCY_GATEWAY_TOPUP_ENABLED",
  "YSIM_PAYMENT_OWNER_ENABLED",
  "GPAY_ENABLED",
  "ONEPAY_ENABLED",
  "UMONEY_ENABLED",
  "GIGAGO_ENABLED",
  "GPAY_VA_ENABLED",
  "GPAY_FAST_ACK_ENABLED",
  "GPAY_DELAYED_RECONCILIATION_ENABLED",
  "CASH_PAYMENT_ENABLED",
];

async function reserveEphemeralPort(excluded = new Set()) {
  while (true) {
    const port = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        assert.ok(address && typeof address === "object");
        const selectedPort = address.port;
        server.close((error) =>
          error ? reject(error) : resolve(selectedPort),
        );
      });
    });
    if (!excluded.has(port)) return port;
  }
}

async function assertPortFree(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
}

function request(port, pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const call = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path: pathname,
        headers: { Host: "ysim.vn", Connection: "close", ...headers },
        timeout: 5_000,
        agent: false,
      },
      (response) => {
        const body = [];
        response.on("data", (chunk) => body.push(chunk));
        response.on("end", () =>
          resolve({
            status: response.statusCode ?? 0,
            location: String(response.headers.location ?? ""),
            body: Buffer.concat(body).toString("utf8"),
          }),
        );
      },
    );
    call.on("timeout", () => call.destroy(new Error("REQUEST_TIMEOUT")));
    call.on("error", reject);
  });
}

async function waitReady(port, child) {
  const deadline = Date.now() + 20_000;
  let lastError;
  while (Date.now() < deadline) {
    assert.equal(
      child.exitCode,
      null,
      `RUNTIME_EXITED_EARLY:${child.exitCode}`,
    );
    try {
      const observation = await request(port, "/vi/support");
      if (observation.status === 200) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw lastError ?? new Error("RUNTIME_READINESS_TIMEOUT");
}

async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === "win32") {
      child.kill("SIGTERM");
    } else {
      process.kill(-child.pid, "SIGTERM");
    }
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }

  let deadline = Date.now() + 5_000;
  while (
    child.exitCode === null &&
    child.signalCode === null &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (child.exitCode === null && child.signalCode === null) {
    try {
      if (process.platform === "win32") {
        child.kill("SIGKILL");
      } else {
        process.kill(-child.pid, "SIGKILL");
      }
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }

    deadline = Date.now() + 5_000;
    while (
      child.exitCode === null &&
      child.signalCode === null &&
      Date.now() < deadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  assert.ok(
    child.exitCode !== null || child.signalCode !== null,
    "RUNTIME_PROCESS_GROUP_NOT_STOPPED",
  );
}

async function withRuntime({ port, routing, token }, callback) {
  await assertPortFree(port);
  const logRoot = await mkdtemp(path.join(tmpdir(), `f07-002n-${port}-`));
  const stdoutPath = path.join(logRoot, "stdout.log");
  const stderrPath = path.join(logRoot, "stderr.log");
  const environment = {
    PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://ysim.vn",
    NEXT_PUBLIC_WOOCOMMERCE_URL: "https://shop.ysim.vn",
    YSIM_API_BASE_URL: "https://build-only.invalid",
    YSIM_MARKET_ROUTING_ENABLED: routing,
    ...Object.fromEntries(executionFlags.map((flag) => [flag, "false"])),
  };
  if (token) environment.YSIM_MARKET_INTERNAL_TOKEN = token;

  const child = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: repoRoot,
      env: environment,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const stdout = [];
  const stderr = [];
  child.stdout.on("data", (chunk) => stdout.push(chunk));
  child.stderr.on("data", (chunk) => stderr.push(chunk));
  try {
    await waitReady(port, child);
    await callback();
  } catch (error) {
    await stop(child);
    await Promise.all([
      import("node:fs/promises").then(({ writeFile }) =>
        writeFile(stdoutPath, Buffer.concat(stdout)),
      ),
      import("node:fs/promises").then(({ writeFile }) =>
        writeFile(stderrPath, Buffer.concat(stderr)),
      ),
    ]);
    const safeLog = `${await readFile(stdoutPath, "utf8")}\n${await readFile(
      stderrPath,
      "utf8",
    )}`.replaceAll(token || "__NO_TOKEN__", "[REDACTED]");
    throw new Error(`${error.message}\n${safeLog}`);
  } finally {
    await stop(child);
    await rm(logRoot, { recursive: true, force: true });
  }
}

const selectedPorts = new Set();
const disabledPort = await reserveEphemeralPort(selectedPorts);
selectedPorts.add(disabledPort);
const enabledPort = await reserveEphemeralPort(selectedPorts);
selectedPorts.add(enabledPort);
const failClosedPort = await reserveEphemeralPort(selectedPorts);
selectedPorts.add(failClosedPort);
console.log("RUNTIME_EPHEMERAL_PORT_SELECTION=PASS_THREE_UNIQUE_PORTS");

await withRuntime({ port: disabledPort, routing: "false", token: "" }, async () => {
  const root = await request(disabledPort, "/");
  assert.equal(root.status, 308);
  assert.equal(root.location, "/vi");
});
console.log("ROUTING_DISABLED_DEFAULT_VI=PASS_308");

const token = "0123456789abcdef".repeat(4);
await withRuntime({ port: enabledPort, routing: "true", token }, async () => {
  const la = await request(enabledPort, "/", { "CF-IPCountry": "LA" });
  assert.equal(la.status, 307);
  assert.equal(la.location, "/lo");

  const global = await request(enabledPort, "/esim", {
    "CF-IPCountry": "US",
  });
  assert.equal(global.status, 307);
  assert.equal(global.location, "/en/esim");

  const explicit = await request(enabledPort, "/vi/support", {
    "CF-IPCountry": "LA",
  });
  assert.equal(explicit.status, 200);
});
console.log("ROUTING_ENABLED_COUNTRY_MATRIX=PASS_LA_AND_GLOBAL");
console.log("EXPLICIT_LOCALIZED_ROUTE=PASS_200_WITHOUT_REWRITE");

await withRuntime({ port: failClosedPort, routing: "true", token: "" }, async () => {
  const root = await request(failClosedPort, "/");
  assert.equal(root.status, 503);
  assert.match(root.body, /MARKET_ROUTING_CONFIGURATION_INVALID/u);
});
console.log("ROUTING_ENABLED_MISSING_TOKEN=PASS_FAIL_CLOSED_503");
console.log(
  "REAL_NEXT_RUNTIME_ROUTING_ACCEPTANCE=PASS_DISABLED_ENABLED_AND_FAIL_CLOSED",
);
