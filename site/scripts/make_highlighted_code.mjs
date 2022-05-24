#! /usr/bin/env node

import shiki from "shiki";
import invariant from "tiny-invariant";
import * as fs from "fs";
import { codeBlock } from "common-tags";

const code = [
  {
    name: "createAnonPostCode",
    code: codeBlock`
    const response = await fetch("$$hostUrl:string$$/api/upload", {
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
    console.log(`Highlighting ${name}...`);
    console.log(code);

    const params = [{ name: "prewrap", type: "boolean" }];

    const highlighted = highlighter.codeToHtml(code, {
      lang: "javascript",
    });
    const withInterpolations = highlighted.replace(
      /\$\$[a-zA-Z]+:[a-zA-Z]+\$\$/,
      (param) => {
        const [paramName, paramType] = param.slice(2, -2).split(":");
        params.push({ name: paramName, type: paramType });
        return "${" + paramName + "}";
      }
    );
    const withInterpolationsPrewrapped = addPrewrap(withInterpolations);

    const destructureCode = `{ ${params
      .map((param) => param.name)
      .join(", ")} }`;
    const typeCode =
      "{" + params.map(({ name, type }) => `${name}: ${type}`).join("; ") + "}";
    const generatedCode = `export const ${name} = (${destructureCode}: ${typeCode}) => prewrap ? \`${withInterpolationsPrewrapped}\` : \`${withInterpolations}\`;`;
    return generatedCode;
  });

  const output = lines.join("\n");
  fs.writeFileSync("app/generated/highlighted_code.ts", output);
}

go();
