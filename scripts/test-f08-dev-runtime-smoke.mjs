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
  "/vi/esim/esim-trung-quoc",
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
  "/en/destinations",
  "/lo/destinations",
  "/en/destinations/asia",
  "/lo/destinations/global",
  "/vi/esim?continent=asia",
  "/vi/esim?continent=europe",
  "/vi/esim?continent=north-america",
  "/vi/esim?continent=south-america",
  "/vi/esim?continent=africa",
  "/vi/esim?continent=oceania",
  "/vi/esim?type=global",
];
const collectionContracts = new Map([
  [
    "/vi/destinations/asia",
    {
      filter: "continent:asia",
      minimumProducts: 1,
      forbidden: [/eSIM Châu Âu/iu, /eSIM Nga/iu],
    },
  ],
  [
    "/vi/destinations/europe",
    {
      filter: "continent:europe",
      minimumProducts: 1,
      forbidden: [/eSIM Châu Á/iu, /eSIM Nam Mỹ/iu],
    },
  ],
  [
    "/vi/destinations/north-america",
    {
      filter: "continent:north-america",
      minimumProducts: 1,
      forbidden: [/eSIM Châu Á/iu, /eSIM Nam Mỹ/iu],
    },
  ],
  [
    "/vi/destinations/south-america",
    {
      filter: "continent:south-america",
      minimumProducts: 1,
      forbidden: [/eSIM Châu Á/iu, /eSIM Bắc Mỹ/iu],
    },
  ],
  [
    "/vi/destinations/africa",
    {
      filter: "continent:africa",
      minimumProducts: 0,
      forbidden: [/eSIM Châu Á/iu, /eSIM Châu Âu/iu, /eSIM Bắc Mỹ/iu],
    },
  ],
  [
    "/vi/destinations/oceania",
    {
      filter: "continent:oceania",
      minimumProducts: 1,
      forbidden: [/eSIM Châu Á/iu, /eSIM Châu Âu/iu, /eSIM Nam Mỹ/iu],
    },
  ],
  [
    "/vi/destinations/global",
    {
      filter: "global:global",
      minimumProducts: 1,
      forbidden: [],
    },
  ],
]);

collectionContracts.set(
  "/en/destinations/asia",
  collectionContracts.get("/vi/destinations/asia"),
);
collectionContracts.set(
  "/lo/destinations/global",
  collectionContracts.get("/vi/destinations/global"),
);

for (const [route, contract] of [...collectionContracts]) {
  const slug = route.split("/").at(-1);
  const queryRoute =
    slug === "global" ? "/vi/esim?type=global" : `/vi/esim?continent=${slug}`;
  collectionContracts.set(queryRoute, contract);
}

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
    if (response.status !== 200) {
      throw new Error(
        `${route} returned HTTP ${response.status}.\n${[stdoutTail, stderrTail]
          .filter(Boolean)
          .join("\n")}`,
      );
    }
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
    const collectionContract = collectionContracts.get(route);
    if (collectionContract) {
      const catalogStart = body.indexOf('<section id="esim-quick-catalog"');
      const catalogEnd = body.indexOf("</section>", catalogStart);
      assert.ok(
        catalogStart >= 0 && catalogEnd > catalogStart,
        `${route} did not render a bounded product catalog section.`,
      );
      const catalogBody = body.slice(catalogStart, catalogEnd);

      assert.ok(
        catalogBody.includes(
          `data-ysim-quick-filter="${collectionContract.filter}"`,
        ),
        `${route} rendered the wrong semantic selection.`,
      );
      assert.ok(
        catalogBody.includes(
          'data-ysim-filter-index="taxonomy-authoritative-v3"',
        ),
        `${route} did not use taxonomy-authoritative filtering.`,
      );
      const productCountMatch = catalogBody.match(
        /data-ysim-product-count="(\d+)"/u,
      );
      assert.ok(
        productCountMatch,
        `${route} did not expose its rendered product count.`,
      );
      const productCount = Number(productCountMatch[1]);
      assert.ok(
        productCount >= collectionContract.minimumProducts,
        `${route} rendered ${productCount} products; expected at least ${collectionContract.minimumProducts}.`,
      );
      for (const forbidden of collectionContract.forbidden) {
        assert.doesNotMatch(
          catalogBody,
          forbidden,
          `${route} contains a cross-collection product matching ${forbidden}.`,
        );
      }
      console.log(
        `DEV_RUNTIME_COLLECTION_${collectionContract.filter
          .replace(/[^a-z0-9]+/gi, "_")
          .toUpperCase()}=PASS_SEMANTIC`,
      );
    }
    const localeMatch = route.match(/^\/(vi|en|lo)\/destinations$/u);
    if (localeMatch) {
      const locale = localeMatch[1];
      assert.match(
        body,
        new RegExp(`href="/${locale}/destinations/[a-z0-9-]+"`, "u"),
        `${route} did not emit locale-preserving canonical destination links.`,
      );
      assert.doesNotMatch(
        body,
        /href="\/(?:vi|en|lo)\/destinations\?/u,
        `${route} emitted a legacy destination query target.`,
      );
      console.log(
        `DEV_RUNTIME_LOCALIZED_CANONICAL_NAVIGATION_${locale.toUpperCase()}=PASS`,
      );
    }
    if (route === "/vi/esim/esim-trung-quoc") {
      assert.match(
        body,
        /id="product-description-content"/u,
        `${route} did not render the product-description presentation.`,
      );
      assert.doesNotMatch(
        body,
        /(?:javascript|vbscript|data):/iu,
        `${route} rendered an unsafe active URL scheme.`,
      );
      console.log("DEV_RUNTIME_PRODUCT_DESCRIPTION_SANITIZER=PASS");
    }
    console.log(
      `DEV_RUNTIME_ROUTE_${route.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}=PASS_200`,
    );
  }

  console.log(
    `F08_DEV_RUNTIME_SMOKE=PASS_${routes.length}_OF_${routes.length}`,
  );
  console.log(
    `F08_COLLECTION_SEMANTIC_RUNTIME=PASS_${collectionContracts.size}_OF_${collectionContracts.size}`,
  );
} finally {
  if (child.exitCode === null) child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}
