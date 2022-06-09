/* NOT USED */
// React Toastify uses CSS variables
// These break inside the shadow DOM
import fs from "fs";
import css, { Rule, Declaration } from "css";
import invariant from "tiny-invariant";

const argv = process.argv;

if (argv.length !== 3) {
  console.error("Usage: node inline_css_vars.js <css_file>");
  process.exit(1);
}

// Read the CSS file
const cssFile = argv[2];
const cssText = fs.readFileSync(cssFile, "utf8");

const { stylesheet } = css.parse(cssText);
const cssVarsRule = stylesheet.rules[0] as Rule;
invariant(
  cssVarsRule.selectors.includes(":root"),
  "CSS file must have a :root rule"
);
const cssVarDeclarations = cssVarsRule.declarations;

const decls: Record<string, string> = {};
for (const _decl of cssVarDeclarations) {
  const decl = _decl as Declaration;
  decls[decl.property] = decl.value;
}

const inlined = cssText.replace(/var\(--[^)]*\)/g, (match) => {
  const varName = match.slice("var(".length, -1);
  const varValue = decls[varName];
  if (!varValue) {
    console.log(`Skipping match: ${match}`);
    return match;
  }
  invariant(varValue, `No variable for ${varName}, and match: ${match}`);
  return varValue;
});

fs.writeFileSync(cssFile.replace(".css", ".inlined.css"), inlined);
