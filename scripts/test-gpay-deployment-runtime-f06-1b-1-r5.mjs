#!/usr/bin/env node
// F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
const serviceName = "ysim-gpay-reconciliation-sweep.service",
  timerName = "ysim-gpay-reconciliation-sweep.timer";
function run(c, a) {
  const r = spawnSync(c, a, { encoding: "utf8", shell: false });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${c} failed: ${r.stderr || r.stdout}`);
  return (r.stdout || "").trim();
}
const service = await readFile(`/etc/systemd/system/${serviceName}`, "utf8");
const timer = await readFile(`/etc/systemd/system/${timerName}`, "utf8");
if (!service.includes("F06.1B-1_R5_DEPLOYMENT_RUNTIME_V1"))
  throw new Error("Service is not R3-managed.");
if (!timer.includes("OnCalendar=*-*-* *:*:00"))
  throw new Error("Timer schedule mismatch.");
const execLine = service.split(/\r?\n/).find((l) => l.startsWith("ExecStart="));
if (!execLine) throw new Error("Missing ExecStart.");
const nodeBin = execLine.slice(10).split(/\s+/)[0];
await access(nodeBin, constants.X_OK);
if (service.includes("ProtectHome=true"))
  throw new Error("ProtectHome=true blocks NVM.");
if (run("systemctl", ["is-enabled", timerName]) !== "enabled")
  throw new Error("Timer not enabled.");
if (run("systemctl", ["is-active", timerName]) !== "active")
  throw new Error("Timer not active.");
if (run("systemctl", ["show", serviceName, "-p", "DropInPaths", "--value"]))
  throw new Error("Service still uses drop-ins.");
if (run("systemctl", ["show", timerName, "-p", "DropInPaths", "--value"]))
  throw new Error("Timer still uses drop-ins.");
const fmt = await readFile(
  "/etc/nginx/conf.d/ysim-safe-access-log.conf",
  "utf8",
);
if (!fmt.includes("$request_method $uri $server_protocol"))
  throw new Error("Unsafe Nginx format.");
const site = await readFile(
  "/etc/nginx/sites-available/sandbox.ysim.vn",
  "utf8",
);
if (
  !site.includes(
    "access_log /var/log/nginx/sandbox.ysim.vn.access.log ysim_safe;",
  )
)
  throw new Error("Sandbox site not using safe log.");
console.log(`PASS Node runtime: ${nodeBin}`);
console.log("PASS source-managed units without drop-ins");
console.log("PASS recurring timer");
console.log("PASS safe Nginx logging");
console.log("PASS: F06.1B-1 R5 deployment runtime contract.");
