export function getCSSOMStyles() {
  const { styleSheets } = document;
  const CSSOMSheets = Array.from(styleSheets).filter((sheet) => {
    var _a, _b;
    const hasHref = Boolean(sheet.href);
    const hasStylesInDOM = (((_b = (_a = sheet.ownerNode) == null ? void 0 : _a.innerText) == null ? void 0 : _b.length) || 0) > 0;
    return sheet.cssRules && !hasHref && !hasStylesInDOM || sheet.ownerNode.id === "_goober";
  });
  const CSSOMStylesText = CSSOMSheets.map((sheet) => Array.from(sheet.cssRules).map((rule) => rule.cssText).join("")).join("");
  return CSSOMStylesText;
}
export const injectCSSOMStyles = (document2) => {
  const styles = getCSSOMStyles();
  if (styles.length === 0)
    return;
  const styleSheet = document2.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.setAttribute("data-css-in-jss", "true");
  const stylesText = document2.createTextNode(getCSSOMStyles());
  styleSheet.appendChild(stylesText);
  document2.head.appendChild(styleSheet);
};
export const serializeCSSInJSStyles = injectCSSOMStyles;
