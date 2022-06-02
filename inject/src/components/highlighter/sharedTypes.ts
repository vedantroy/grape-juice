import { HighlightId, UserId } from "@site/db/types.server";
import { Rect } from "src/utils/rect";

export type DeserializedPermanentHighlight = {
  userId: UserId;
  container: Element;
  rects: Rect[];
  area: number;
  id: HighlightId;
};
