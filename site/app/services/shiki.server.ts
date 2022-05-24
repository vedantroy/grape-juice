import shiki, { getHighlighter as _getHighlighter } from "shiki";
import invariant from "tiny-invariant";

let highlighter: shiki.Highlighter | null = null;

export async function getHighlighter(): Promise<shiki.Highlighter> {
  if (!highlighter) {
    highlighter = await _getHighlighter({ theme: "material-palenight" });
  }
  return highlighter;
}

export function addPrewrap(code: string): string {
  const prefix = "<pre";
  invariant(
    code.startsWith(prefix),
    "HTML for highlighted code must start with <pre"
  );
  return prefix + ` style="white-space: pre-wrap" ` + code.slice(prefix.length);
}
