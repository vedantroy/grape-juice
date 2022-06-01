import * as _ from "lodash-es";
import React, { Fragment } from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";
import type { HighlightId, UserId } from "@site/db/types.server";
import { getColorFromUserId } from "src/utils/userId";
import invariant from "tiny-invariant";
import { DeserializedPermanentHighlight } from "./sharedTypes";
import CommentBox from "./commentBox";

export type PermanentHighlight = {
  ranges: Range[];
  userId: UserId;
  containerSelector: string;
};

export type PermanentHighlighterProps = {
  highlights: Record<HighlightId, PermanentHighlight>;
};

// TODO: In the future we could have a backup strategy involving ranges
// if the container selector is not found
function getContainerElement(containerSelector: string): Element {
  const elem = document.body.querySelector(containerSelector);
  invariant(elem, `could not find element for selector ${containerSelector}`);
  return elem;
}

export default function PermanentHighlighter({
  highlights,
}: PermanentHighlighterProps) {
  if (_.isEmpty(highlights)) return null;

  const deserializedHighlights: DeserializedPermanentHighlight[] = _.toPairs(
    highlights
  ).map(([id, { userId, ranges, containerSelector }]) => ({
    id: id as HighlightId,
    userId,
    rects: ranges.map((r) => r.getBoundingClientRect()),
    container: getContainerElement(containerSelector),
  }));

  return (
    <>
      <CommentBox highlights={deserializedHighlights} />
      <Container>
        {deserializedHighlights.map(({ rects, userId, id }) => (
          <Highlight
            key={id}
            color={getColorFromUserId(userId)}
            rects={rects}
            opacity="high"
          />
        ))}
      </Container>
    </>
  );
}
