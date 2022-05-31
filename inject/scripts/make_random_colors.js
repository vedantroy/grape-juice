#! /usr/bin/env node

const fs = require("fs");
const randomColor = require("randomcolor");

const NUM_COLORS = 50;

let sourceCode = "export default [";
for (let i = 0; i < NUM_COLORS; ++i) {
  // todo: mess around w/ luminosity?
  const color = randomColor();
  sourceCode += `"${color}",`;
}
sourceCode += "]";

fs.writeFileSync("./src/generated/colors.ts", sourceCode);
