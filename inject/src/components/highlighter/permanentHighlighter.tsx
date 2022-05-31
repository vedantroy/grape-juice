import * as _ from "lodash-es";
import React, { Fragment } from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";
import type { HighlightId, UserId } from "@site/db/types.server";
import { getColorFromUserId } from "src/utils/userId";
import invariant from "tiny-invariant";

export type PermanentHighlight = {
  ranges: Range[];
  userId: UserId;
  containerSelector: string;
};

export type PermanentHighlighterProps = {
  highlights: Record<HighlightId, PermanentHighlight>;
};

// ranges is a backup we can implement in the future -- it's a brute
// force way of finding the most common ancestor element
function getContainerElement(
  containerSelector: string,
  ranges: Range[]
): Element {
  const elem = document.body.querySelector(containerSelector);
  invariant(elem, `could not find element for selector ${containerSelector}`);
  return elem;
}

const COMMENT_BOX_WIDTH_PX = 60;
const COMMENT_BOX_OFFSET = 20;

function getCoords(elem: Element): { x: number; y: number } {
  const { right, top } = elem.getBoundingClientRect();
  console.log("offset width, x", document.body.offsetWidth, right);
  const inScreenX = Math.min(
    document.body.offsetWidth - COMMENT_BOX_WIDTH_PX,
    right + COMMENT_BOX_OFFSET
  );
  return { x: inScreenX, y: top };
}

export default function PermanentHighlighter({
  highlights,
}: PermanentHighlighterProps) {
  const highlightIdToRects = _.toPairs(highlights).map<
    [
      HighlightId,
      { rects: DOMRect[]; userId: UserId; coords: { x: number; y: number } }
    ]
  >(([highlightId, { ranges, userId, containerSelector }]) => [
    highlightId as HighlightId,
    {
      rects: ranges.map((r) => r.getBoundingClientRect()),
      userId,
      coords: getCoords(getContainerElement(containerSelector, ranges)),
    },
  ]);

  return (
    <Container>
      {highlightIdToRects.map(
        ([
          highlightId,
          {
            rects,
            userId,
            coords: { x, y },
          },
        ]) => (
          <Fragment key={highlightId}>
            <Highlight
              color={getColorFromUserId(userId)}
              rects={rects}
              opacity="high"
            />
            <div
              className="absolute z-50 bg-black h-5 w-5"
              style={{ top: y, left: x + 20 }}
            >
              Hi!
            </div>
          </Fragment>
        )
      )}
    </Container>
  );
}
