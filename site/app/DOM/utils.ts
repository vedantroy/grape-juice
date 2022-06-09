// From: https://gist.github.com/Robdel12/5cd25c39ccf58b192402c2c984146d81

export function getCSSOMStyles(): string {
  const { styleSheets } = document;
  const CSSOMSheets = Array.from(styleSheets).filter((sheet) => {
    const hasHref = Boolean(sheet.href);
    //@ts-expect-error - too hard to Typescriptify
    const hasStylesInDOM = (sheet.ownerNode?.innerText?.length || 0) > 0;
    return (sheet.cssRules && !hasHref! && !hasStylesInDOM) ||
          // This means it's probably injected by the goober css in js lib
          // We need this b/c (for some reason),
          // goober style sheets can contain
          // actual CSS text
          (sheet.ownerNode as any)?.id === "_goober";
  });

  const CSSOMStylesText = CSSOMSheets.map((sheet) =>
    Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("")
  ).join("");
  return CSSOMStylesText;
}

export const injectCSSOMStyles = (document: Document) => {
  const styles = getCSSOMStyles();
  if (styles.length === 0) return;

  const styleSheet = document.createElement("style");
  // TODO: Why is this deprecated?
  styleSheet.type = "text/css";
  styleSheet.setAttribute("data-css-in-jss", "true");
  const stylesText = document.createTextNode(getCSSOMStyles());
  styleSheet.appendChild(stylesText);
  document.head.appendChild(styleSheet);
};

export const serializeCSSInJSStyles = injectCSSOMStyles;
