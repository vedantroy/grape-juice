import invariant from "tiny-invariant";

// https://stackoverflow.com/questions/494143
export function htmlToElement(html: string): ChildNode {
  const template = document.createElement("template");
  // Never return a text node of whitespace as the result
  html = html.trim();
  template.innerHTML = html;
  invariant(template.content.firstChild, `Could not parse HTML: ${html}`);
  return template.content.firstChild;
}
