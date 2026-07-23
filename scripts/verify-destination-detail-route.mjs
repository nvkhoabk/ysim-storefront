#!/usr/bin/env node

const args = process.argv.slice(2);

function argument(name, fallback) {
  const prefix = `--${name}=`;
  const match = args.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const baseUrl = argument("base-url", "http://localhost:3000").replace(
  /\/$/,
  "",
);
const destinations = argument(
  "destinations",
  "japan,korea,thailand,singapore,usa,europe",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (destinations.length === 0) {
  console.error("No destinations supplied.");
  process.exit(2);
}

let failures = 0;

for (const slug of destinations) {
  const url = `${baseUrl}/destinations/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
      },
      redirect: "follow",
    });
    const html = await response.text();
    const hasBackLink = html.includes("Xem điểm đến");
    const hasCatalogHeading = html.includes("Gói eSIM phù hợp");
    const passed = response.status === 200 && hasBackLink && hasCatalogHeading;

    console.log(
      `${passed ? "PASS" : "FAIL"} ${slug}: HTTP ${response.status}` +
        ` · back=${hasBackLink}` +
        ` · catalog=${hasCatalogHeading}`,
    );

    if (!passed) {
      failures += 1;
    }
  } catch (error) {
    failures += 1;
    console.error(
      `FAIL ${slug}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (failures > 0) {
  console.error(`FAILED: ${failures} destination route(s) did not pass.`);
  process.exit(1);
}

console.log(
  `PASS: ${destinations.length} destination detail route(s) validated.`,
);
