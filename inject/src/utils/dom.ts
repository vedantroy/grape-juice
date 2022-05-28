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

export function getRange(): Range | null {
  const selection = document.getSelection();
  // TODO: Not sure `selectedText` is every actually empty
  const selectedText = selection?.toString() || "";
  if (selection && selection.rangeCount > 0 && selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    return range.collapsed ? null : range;
  } else return null;
}
