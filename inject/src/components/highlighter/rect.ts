import { makeRelativeToDocument } from "src/utils/rect";

export function getRectsFromRanges(ranges: Range[]) {
  return ranges.flatMap((r) =>
    Array.from(r.getClientRects()).map(makeRelativeToDocument)
  );
}
