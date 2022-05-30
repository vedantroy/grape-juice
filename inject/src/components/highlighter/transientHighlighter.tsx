import type { HighlightId, UserId } from "@site/db/types.server";
import * as _ from "lodash-es";
import React from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";

export type TransientHighlighterProps = {
  highlights: Record<HighlightId, { ranges: Range[]; userId: UserId }>;
};

export default function TransientHighlighter({
  highlights,
}: TransientHighlighterProps) {
  console.log(highlights);

  const userIdToRects = _.toPairs(highlights).map<
    [HighlightId, { rects: DOMRect[]; userId: UserId }]
  >(([highlightId, { ranges, userId }]) => [
    highlightId as HighlightId,
    { rects: ranges.map((r) => r.getBoundingClientRect()), userId },
  ]);

  return (
    <Container>
      {userIdToRects.map(([highlightId, { rects, userId }]) => (
        <Highlight key={highlightId} rects={rects} opacity="low" />
      ))}
    </Container>
  );
}
