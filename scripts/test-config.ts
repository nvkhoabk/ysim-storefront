import {
  getConfig,
} from "@/lib/ysim-api/config";

async function main() {

  const config =
    await getConfig();

  console.log(config);
}

main();
