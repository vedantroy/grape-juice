import type { UserId } from "@site/db/types.server";
import * as _ from "lodash-es";
import React from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";

export type TransientHighlighterProps = {
  highlights: Record<UserId, { ranges: Range[] }>;
};

export default function TransientHighlighter({
  highlights,
}: TransientHighlighterProps) {
  const userIdToRects = _.toPairs(highlights).map<
    [UserId, { rects: DOMRect[] }]
  >(([userId, { ranges }]) => [
    userId as UserId,
    { rects: ranges.map((r) => r.getBoundingClientRect()) },
  ]);

  return (
    <Container>
      {userIdToRects.map(([userId, { rects }]) => (
        // We can use userId as the key because each user will
        // only have 1 transient highlight at a time
        <Highlight key={userId} rects={rects} opacity="low" />
      ))}
    </Container>
  );
}
