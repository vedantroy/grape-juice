#! /usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");
const fs = require("fs-extra");

// We don't run tsc b/c it seems broken and the IDE is giving good enough type checking
spawnSync("npm", ["run", "build"], { stdio: "inherit" });

const DEST_DIR = path.join(__dirname, "..", "site", "public", "inject");

fs.rmSync(DEST_DIR, { recursive: true });
fs.mkdirSync(DEST_DIR);
fs.copySync("dist/assets", DEST_DIR);
