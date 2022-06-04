#! /usr/bin/env node

import shiki from "shiki";
import invariant from "tiny-invariant";
import * as fs from "fs";
import { codeBlock } from "common-tags";
import path from "path";

// get file names in scripts folder
const utilsFileName = fs.readdirSync(
  path.join(process.cwd(), "public", "utils")
)[0];

const code = [
  {
    name: "createAnonPostCode",
    code: codeBlock`
    m = await import("$$hostUrl:string$$/utils/${utilsFileName}");
    // If your site has CSS in JS, use this
    m.serializeCSSInJSStyles(document);
    response = await fetch("$$hostUrl:string$$/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
           html: document.documentElement.outerHTML,
           // You can change this to your own post title
           title: document.title,
           // query parameters/URL fragments are ignored
           url: window.location.href,
      })
    });
    await response.json();
    `,
  },
];

export function addPrewrap(code) {
  const prefix = "<pre";
  invariant(
    code.startsWith(prefix),
    `HTML for highlighted code must start with <pre, got: ${code}`
  );
  return prefix + ` style="white-space: pre-wrap"` + code.slice(prefix.length);
}

async function go() {
  const highlighter = await shiki.getHighlighter({
    theme: "material-palenight",
  });

  const lines = code.map(({ name, code }) => {
    console.log(`Highlighting template: ${name}...`);
    console.log(code);
    console.log("================\n\n");

    const params = [{ name: "prewrap", type: "boolean" }];

    function addInterpolations(s) {
      return s.replace(/\$\$[a-zA-Z]+:[a-zA-Z]+\$\$/g, (param) => {
        const [paramName, paramType] = param.slice(2, -2).split(":");
        if (params.find((p) => p.name === paramName) === undefined) {
          params.push({ name: paramName, type: paramType });
        }
        return "${" + paramName + "}";
      });
    }

    const highlighted = highlighter.codeToHtml(code, {
      lang: "javascript",
    });

    const HTML = addInterpolations(highlighted);
    const PrewrappedHTML = addPrewrap(HTML);
    const codeWithInterpolations = addInterpolations(code);

    const destructureCode = `{ ${params
      .map((param) => param.name)
      .join(", ")} }`;
    const typeCode =
      "{" + params.map(({ name, type }) => `${name}: ${type}`).join("; ") + "}";
    const generatedCode = `export const ${name} = (${destructureCode}: ${typeCode}) => ({ HTML: prewrap ? \`${PrewrappedHTML}\` : \`${HTML}\`, code: \`${codeWithInterpolations}\` });`;
    return generatedCode;
  });

  const output = lines.join("\n");
  fs.writeFileSync("app/generated/highlighted_code.ts", output);
}

go();
