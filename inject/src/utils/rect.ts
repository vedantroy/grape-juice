export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

// bounding rects are relative to the viewport:
// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
// Code from:
// https://stackoverflow.com/questions/16949642/getboundingclientrect-but-relative-to-the-entire-document
export function makeRelativeToDocument(relativeToViewport: DOMRect): Rect {
  const { top, left, width, height } = relativeToViewport;
  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    width,
    height,
  };
}
