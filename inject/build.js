#! /usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");
const fs = require("fs-extra");

// We don't run tsc b/c it seems broken and the IDE is giving good enough type checking
spawnSync("npm", ["run", "build"], { stdio: "inherit" });

const SRC_DIR = "dist/assets";
const DEST_DIR = path.join(__dirname, "..", "site", "public", "inject");

fs.rmSync(DEST_DIR, { recursive: true });
fs.mkdirSync(DEST_DIR);
fs.copySync(SRC_DIR, DEST_DIR);

const jsFile = fs.readdirSync(SRC_DIR).find((f) => f.endsWith(".js"));

const ROOT = "/inject";
const code = `
export const SCRIPT_SRC = "${ROOT}/${jsFile}";
`;

fs.writeFileSync(
  path.join(__dirname, "..", "site", "app", "generated", "injected_sources.ts"),
  code
);
