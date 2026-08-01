#!/usr/bin/env node

function argumentValue(name, fallback = null) {
  const equalsPrefix = `${name}=`;
  const equalsArgument = process.argv.find((argument) =>
    argument.startsWith(equalsPrefix),
  );

  if (equalsArgument) return equalsArgument.slice(equalsPrefix.length);

  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

function positiveInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  return String(value).replace(/\/$/, "");
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { response, body };
}

function expectedCountFromSubmission(submission) {
  return (submission?.preview?.items ?? []).reduce((total, item) => {
    const amount = Number(item.amount);
    return total + (Number.isInteger(amount) && amount > 0 ? amount : 0);
  }, 0);
}

function deliveredCountFromSubmission(submission) {
  return (submission?.snapshot?.deliveredEsims ?? []).filter((esim) => {
    return (
      Number(esim.status) === 1 ||
      String(esim.status_name).trim().toLowerCase() === "delivered"
    );
  }).length;
}

async function main() {
  const baseUrl = normalizeBaseUrl(
    argumentValue("--base-url", "http://localhost:3000"),
  );
  const orderId = positiveInteger(argumentValue("--order-id"), "--order-id");
  const action = argumentValue("--action", "retry-fulfillment");
  const mode = argumentValue("--mode", "live");
  const expect = argumentValue("--expect", "processing-or-succeeded");
  const secret = process.env.GIGAGO_TEST_SECRET;

  if (!secret) throw new Error("GIGAGO_TEST_SECRET is missing.");

  console.log(`TARGET=${baseUrl}`);
  console.log(`ORDER_ID=${orderId}`);
  console.log(`ACTION=${action}`);
  console.log(`MODE=${mode}`);
  console.log(`EXPECT=${expect}`);

  const { response, body } = await requestJson(
    `${baseUrl}/api/fulfillment/gigago/recovery`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-ysim-test-secret": secret,
      },
      body: JSON.stringify({ orderId, action, mode }),
    },
  );

  console.log(`HTTP=${response.status}`);
  console.log(JSON.stringify(body, null, 2));

  if (!response.ok || !body?.success) {
    throw new Error(`Recovery endpoint failed with HTTP ${response.status}.`);
  }

  const lifecycle = body.result?.lifecycle ?? body.result;
  const submission = body.result?.submission ?? null;
  const actualState = lifecycle?.fulfillmentState;

  if (expect === "processing" && actualState !== "processing") {
    throw new Error(`Expected processing, received ${actualState}.`);
  }

  if (expect === "succeeded" && actualState !== "succeeded") {
    throw new Error(`Expected succeeded, received ${actualState}.`);
  }

  if (
    expect === "processing-or-succeeded" &&
    !["processing", "succeeded"].includes(actualState)
  ) {
    throw new Error(
      `Expected processing or succeeded, received ${actualState}.`,
    );
  }

  if (submission) {
    const expectedEsimCount = expectedCountFromSubmission(submission);
    const returnedEsimCount = submission.snapshot?.deliveredEsims?.length ?? 0;
    const deliveredEsimCount = deliveredCountFromSubmission(submission);

    console.log(
      JSON.stringify(
        {
          assessment: {
            expectedEsimCount,
            returnedEsimCount,
            deliveredEsimCount,
            lifecycleState: actualState,
          },
        },
        null,
        2,
      ),
    );

    if (actualState === "succeeded") {
      if (expectedEsimCount <= 0) {
        throw new Error("Succeeded without a positive expected eSIM count.");
      }

      if (
        returnedEsimCount !== expectedEsimCount ||
        deliveredEsimCount !== expectedEsimCount
      ) {
        throw new Error(
          "Succeeded but returned/delivered eSIM count does not equal expected count.",
        );
      }
    }
  }

  console.log(
    `PASS: F04.3.1 lifecycle ${actualState} for Woo order ${orderId}.`,
  );
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
