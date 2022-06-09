import type { UserId } from "@site/db/types.server";
import * as _ from "lodash-es";
import React from "react";
import { getColorFromUserId } from "src/utils/userId";
import { Container } from "./container";
import { Highlight } from "./highlight";
import useWindowDimensions from "../hooks/useWIndowDimensions";
import { makeRelativeToDocument, Rect } from "src/utils/rect";
import { getRectsFromRanges } from "./rect";
// import useWindowScroll from "@react-hook/window-scroll";

export type TransientHighlighterProps = {
  highlights: Record<UserId, { ranges: Range[] }>;
};

export default function TransientHighlighter({
  highlights,
}: TransientHighlighterProps) {
  useWindowDimensions();
  // useWindowScroll(SCROLL_UPDATE_FPS);

  const userIdToRects = _.toPairs(highlights).map<[UserId, { rects: Rect[] }]>(
    ([userId, { ranges }]) => [
      userId as UserId,
      { rects: getRectsFromRanges(ranges) },
    ]
  );

  return (
    <Container>
      {userIdToRects.map(([userId, { rects }]) => (
        // We can use userId as the key because each user will
        // only have 1 transient highlight at a time
        <Highlight
          key={userId}
          color={getColorFromUserId(userId)}
          rects={rects}
          opacity="low"
        />
      ))}
    </Container>
  );
}
