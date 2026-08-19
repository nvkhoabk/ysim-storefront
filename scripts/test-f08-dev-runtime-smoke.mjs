import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const host = "127.0.0.1";
const routes = [
  "/vi",
  "/vi/esim?destination=korea",
  "/vi/esim",
  "/vi/support",
  "/vi/destinations",
  "/vi/destinations/japan",
  "/vi/destinations/united-states",
  "/vi/destinations/singapore",
  "/vi/destinations/korea",
  "/vi/destinations/asia",
  "/vi/destinations/europe",
  "/vi/destinations/north-america",
  "/vi/destinations/south-america",
  "/vi/destinations/africa",
  "/vi/destinations/oceania",
  "/vi/destinations/global",
];
const timeoutMilliseconds = 180_000;

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const { port } = address;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

function appendTail(current, chunk) {
  return `${current}${chunk}`.slice(-40_000);
}

async function waitForResponse(url, child, output) {
  const deadline = Date.now() + timeoutMilliseconds;
  let lastError;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Development server exited with ${child.exitCode}.\n${output()}`,
      );
    }
    try {
      return await fetch(url, { redirect: "manual" });
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw new Error(
    `Timed out waiting for ${url}: ${lastError?.message ?? "unknown error"}\n${output()}`,
  );
}

const repositoryRoot = process.cwd();
const nextBin = path.join(
  repositoryRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
await access(nextBin);

const port = await availablePort();
const baseUrl = `http://${host}:${port}`;
let stdoutTail = "";
let stderrTail = "";
const child = spawn(
  process.execPath,
  [nextBin, "dev", "--webpack", "--hostname", host, "--port", String(port)],
  {
    cwd: repositoryRoot,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
child.stdout.on("data", (chunk) => {
  stdoutTail = appendTail(stdoutTail, chunk.toString());
});
child.stderr.on("data", (chunk) => {
  stderrTail = appendTail(stderrTail, chunk.toString());
});

try {
  for (const route of routes) {
    const response = await waitForResponse(`${baseUrl}${route}`, child, () =>
      [stdoutTail, stderrTail].filter(Boolean).join("\n"),
    );
    const body = await response.text();
    assert.equal(
      response.status,
      200,
      `${route} returned HTTP ${response.status}.`,
    );
    assert.doesNotMatch(
      body,
      /this page could not be found/i,
      `${route} rendered a soft not-found page.`,
    );
    assert.doesNotMatch(
      body,
      /STOREFRONT_LOCALE_PROVIDER_REQUIRED|Switched to client rendering because the server rendering errored/i,
      `${route} rendered a locale-provider server error.`,
    );
    console.log(
      `DEV_RUNTIME_ROUTE_${route.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}=PASS_200`,
    );
  }

  console.log(
    `F08_DEV_RUNTIME_SMOKE=PASS_${routes.length}_OF_${routes.length}`,
  );
} finally {
  if (child.exitCode === null) child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}
