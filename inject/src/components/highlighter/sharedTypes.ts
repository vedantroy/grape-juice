import { HighlightId, Reply, UserId, Highlight } from "@site/db/types.server";
import { Rect } from "src/utils/rect";

export type HighlightWithActiveRanges = Omit<Highlight, "range"> & {
  ranges: Range[];
};

export type InstantiatedHighlight = Omit<
  HighlightWithActiveRanges,
  "ranges" | "containerSelector"
> & {
  area: number;
  rects: Rect[];
  container: Element;
};
