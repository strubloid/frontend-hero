#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";

const IMAGE = process.env.DOCKER_IMAGE ?? "frontend-realms";
const CONTAINER_NAME = "frontend-realms-test";
const PORT = "3001";
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 1500;

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });
  if (result.error) {
    console.error(`FAILED: ${cmd} ${args.join(" ")} — ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function httpGet(url) {
  return new Promise((resolve) => {
    const req = request(url, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, body: "timeout" });
    });
    req.on("error", () => resolve({ status: 0, body: "error" }));
    req.end();
  });
}

// --- Step 1: Build ---
console.log(`\n=== Step 1: Building Docker image: ${IMAGE} ===`);
run("docker", ["build", "-t", IMAGE, "."]);
console.log("✓ Image built successfully.");

// --- Step 2: Clean up any leftover container ---
try {
  spawnSync("docker", ["rm", "-f", CONTAINER_NAME], { stdio: "ignore" });
} catch {
  // ignore
}

// --- Step 3: Start container ---
console.log(`\n=== Step 2: Starting container: ${CONTAINER_NAME} ===`);
const startResult = spawnSync(
  "docker",
  ["run", "-d", "--name", CONTAINER_NAME, "-p", `${PORT}:3000`, "-e", `PORT=3000`, IMAGE],
  { stdio: ["inherit", "pipe", "inherit"], encoding: "utf-8" },
);
if (startResult.status !== 0) {
  console.error("FAILED: Could not start Docker container");
  process.exit(1);
}
const containerId = startResult.stdout?.trim();
console.log(`✓ Container started (${containerId ?? CONTAINER_NAME}).`);

let exitedCleanly = false;

try {
  // --- Step 4: Poll health endpoint ---
  console.log(
    `\n=== Step 3: Waiting for health endpoint (http://localhost:${PORT}/api/health) ===`,
  );
  let healthy = false;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    console.log(`  Attempt ${i}/${MAX_RETRIES}...`);
    const resp = await httpGet(`http://localhost:${PORT}/api/health`);
    if (resp.status === 200) {
      try {
        const body = JSON.parse(resp.body);
        if (body.status === "ok") {
          console.log(`  ✓ Health check passed: ${resp.body}`);
          healthy = true;
          break;
        }
      } catch {
        // parse failure, retry
      }
    }
    await sleep(RETRY_DELAY_MS);
  }

  if (!healthy) {
    console.error("FAILED: Health endpoint did not return 200 OK within timeout");
    const logs = spawnSync("docker", ["logs", CONTAINER_NAME], {
      stdio: ["inherit", "pipe", "inherit"],
      encoding: "utf-8",
    });
    if (logs.stdout) console.error("Container logs:", logs.stdout.slice(0, 2000));
    process.exit(1);
  }

  // --- Step 5: Verify main page loads ---
  console.log(`\n=== Step 4: Verifying main page loads ===`);
  const pageResp = await httpGet(`http://localhost:${PORT}/`);
  if (pageResp.status === 200 && pageResp.body.length > 0) {
    console.log(`✓ Main page loaded (status ${pageResp.status}, ${pageResp.body.length} bytes).`);
  } else {
    console.error(`FAILED: Main page returned status ${pageResp.status}`);
    process.exit(1);
  }

  exitedCleanly = true;
} finally {
  // --- Step 6: Clean up ---
  console.log(`\n=== Step 5: Cleaning up container ===`);
  spawnSync("docker", ["stop", CONTAINER_NAME], { stdio: "ignore" });
  spawnSync("docker", ["rm", CONTAINER_NAME], { stdio: "ignore" });
  console.log("✓ Container cleaned up.");
}

console.log("\n✓✓✓ Docker image verification complete! ✓✓✓");
