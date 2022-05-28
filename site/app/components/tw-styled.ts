import React from "react";
import { fromPairs } from "lodash-es";
import clsx from "clsx";

// This is my styled-components replacement
// Taken from:
// https://github.com/MathiasGilson/Tailwind-Styled-Component/blob/master/src/domElements.ts
const elementsArray: (keyof JSX.IntrinsicElements)[] = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",

  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan",
];

type TagName = keyof JSX.IntrinsicElements;
type Wrapper<T extends TagName> = JSX.IntrinsicElements[T] & {
  children?: React.ReactChildren | React.ReactNode;
};

function createElementWithClasses<T extends TagName>(
  tag: T,
  className: string
) {
  return ({ children, className: propsClassName, ...props }: Wrapper<T>) => {
    return React.createElement(tag, {
      children,
      ...props,
      className: clsx(className, propsClassName),
    });
  };
}

type Helper = {
  [Prop in keyof JSX.IntrinsicElements]: (
    x: string
  ) => (args: Wrapper<Prop>) => JSX.Element;
};

//@ts-ignore - Lodash's `Dictionary` type only supports `string` keys
const attributeNameToConstructor = fromPairs(
  elementsArray.map((tagName) => [
    tagName,
    (className: string) =>
      createElementWithClasses(tagName, className.trim().replace("\n", " ")),
  ])
) as Helper;

export default attributeNameToConstructor;
