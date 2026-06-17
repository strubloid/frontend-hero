#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const image = process.env.DOCKER_IMAGE ?? "frontend-realms";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Building Docker image: ${image}`);
run("docker", ["build", "-t", image, "."]);

console.log("Docker image built successfully.");
console.log("To run locally: npm run docker:run");
