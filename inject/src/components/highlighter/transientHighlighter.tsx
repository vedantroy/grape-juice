import type { UserId } from "@site/db/types.server";
import * as _ from "lodash-es";
import React from "react";
import { getColorFromUserId } from "src/utils/userId";
import { Container } from "./container";
import { Highlight } from "./highlight";
import useWindowDimensions from "../hooks/useWIndowDimensions";
import { makeRelativeToDocument } from "src/utils/rect";

export type TransientHighlighterProps = {
  highlights: Record<UserId, { ranges: Range[] }>;
};

export default function TransientHighlighter({
  highlights,
}: TransientHighlighterProps) {
  useWindowDimensions();

  //if (!_.isEmpty(highlights)) {
  //  //@ts-ignore
  //  window.highlights = highlights;
  //  console.log("added to window");
  //  debugger;
  //}

  const userIdToRects = _.toPairs(highlights).map<
    [UserId, { rects: DOMRect[] }]
  >(([userId, { ranges }]) => [
    userId as UserId,
    {
      rects: ranges.flatMap((r) =>
        Array.from(r.getClientRects()).map(makeRelativeToDocument)
      ),
    },
  ]);

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
