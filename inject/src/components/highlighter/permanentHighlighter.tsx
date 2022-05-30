import * as _ from "lodash-es";
import React from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";
import type { HighlightId, UserId } from "@site/db/types.server";

export type PermanentHighlighterProps = {
  highlights: Record<HighlightId, { ranges: Range[]; userId: UserId }>;
};

export default function PermanentHighlighter({
  highlights,
}: PermanentHighlighterProps) {
  const highlightIdToRects = _.toPairs(highlights).map<
    [HighlightId, { rects: DOMRect[]; userId: UserId }]
  >(([highlightId, { ranges, userId }]) => [
    highlightId as HighlightId,
    { rects: ranges.map((r) => r.getBoundingClientRect()), userId },
  ]);

  console.log(highlightIdToRects);

  return (
    <Container>
      {highlightIdToRects.map(([highlightId, { rects, userId }]) => (
        <Highlight key={highlightId} rects={rects} opacity="high" />
      ))}
    </Container>
  );
}
