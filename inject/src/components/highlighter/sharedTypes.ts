import { HighlightId, UserId } from "@site/db/types.server";

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type DeserializedPermanentHighlight = {
  userId: UserId;
  container: Element;
  rects: Rect[];
  id: HighlightId;
};
