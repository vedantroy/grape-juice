import * as _ from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "./container";
import { Highlight } from "./highlight";
import type { HighlightId, PostId } from "@site/db/types.server";
import { getColorFromUserId } from "src/utils/userId";
import invariant from "tiny-invariant";
import {
  InstantiatedHighlight,
  HighlightWithActiveRanges,
} from "./sharedTypes";
import CommentBox from "./commentBox";
import useWindowDimensions from "../hooks/useWIndowDimensions";
import { getRectsFromRanges } from "./rect";
import { Rect } from "src/utils/rect";
import Flatbush from "flatbush";

export type PermanentHighlighterProps = {
  highlights: Record<HighlightId, HighlightWithActiveRanges>;
  postId: PostId;
};

// TODO: In the future we could have a backup strategy involving ranges
// if the container selector is not found
function getContainerElement(containerSelector: string): Element {
  const elem = document.body.querySelector(containerSelector);
  invariant(elem, `could not find element for selector ${containerSelector}`);
  return elem;
}

type RectIdxToHighlightAreaAndId = Array<{
  totalHighlightArea: number;
  id: HighlightId;
}>;

export default function PermanentHighlighter({
  highlights,
  postId,
}: PermanentHighlighterProps) {
  const { width, height } = useWindowDimensions();

  const [deserializedHighlights, rectIdxToAreaAndId, flatbush]: [
    InstantiatedHighlight[],
    RectIdxToHighlightAreaAndId,
    Flatbush | null
  ] = useMemo(() => {
    const idWithHighlight = _.toPairs(highlights) as Array<
      [HighlightId, HighlightWithActiveRanges]
    >;
    if (idWithHighlight.length === 0) return [[], [], null];

    let allRects: Rect[] = [];
    let rectIdxToAreaAndId: RectIdxToHighlightAreaAndId = [];

    const deserializedHighlights = idWithHighlight.map(
      ([_id, { userId, ranges, containerSelector, replies }]) => {
        const id = _id as HighlightId;
        const rects = getRectsFromRanges(ranges);
        allRects = allRects.concat(rects);

        const area = _.sum(rects.map(({ width, height }) => width * height));
        rectIdxToAreaAndId = rectIdxToAreaAndId.concat(
          rects.map((_) => ({ totalHighlightArea: area, id }))
        );

        return {
          id: id as HighlightId,
          userId,
          rects,
          area,
          replies,
          container: getContainerElement(containerSelector),
        };
      }
    );

    const flatbush = new Flatbush(allRects.length);
    allRects.forEach((rect) => {
      flatbush.add(
        rect.left,
        rect.top,
        rect.left + rect.width,
        rect.top + rect.height
      );
    });
    flatbush.finish();

    return [deserializedHighlights, rectIdxToAreaAndId, flatbush];
  }, [highlights, width, height]);

  const [activeHighlightId, setActiveHighlightId] =
    useState<HighlightId | null>(null);

  const [hoveredHighlightId, setHoveredHighlightId] =
    useState<HighlightId | null>(null);

  const getIntersectingId = useCallback(
    (e: MouseEvent): HighlightId | null => {
      if (_.isEmpty(highlights)) return null;

      const { clientX: relativeToViewportX, clientY: relativeToViewportY } = e;
      const absX = relativeToViewportX + window.scrollX;
      const absY = relativeToViewportY + window.scrollY;

      const intersectingRectIdxs = flatbush!!.search(absX, absY, absX, absY);
      const intersectingRects = intersectingRectIdxs.map(
        (idx) => rectIdxToAreaAndId[idx]
      );

      intersectingRects.sort(
        (a, b) => a.totalHighlightArea - b.totalHighlightArea
      );

      if (intersectingRects.length === 0) {
        return null;
      }
      const smallestHighlightId = intersectingRects[0].id;
      return smallestHighlightId;
    },
    [rectIdxToAreaAndId, flatbush, highlights]
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const id = getIntersectingId(e);
      // This doesn't always work b/c
      // the underlying element may have
      // a custom cursor style.
      // There's nothing we can do in that scenario
      // The code that tries to use !important still doesn't work
      document.body.style.cursor = id === null ? "auto" : "pointer";
      // document.body.style.setProperty(
      //   "cursor",
      //   id !== null ? "pointer" : "auto",
      //   id !== null ? "important" : undefined
      // );
      setHoveredHighlightId(id);
    }

    function onClick(e: MouseEvent) {
      const id = getIntersectingId(e);
      setActiveHighlightId(id);
    }

    const throttled = _.throttle(onMouseMove, 10);
    document.addEventListener("mousemove", throttled);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("mousemove", throttled);
      document.removeEventListener("click", onClick);
    };
  }, [rectIdxToAreaAndId, flatbush, activeHighlightId]);

  if (_.isEmpty(highlights)) return null;

  return (
    <>
      <CommentBox
        postId={postId}
        activeHighlightId={activeHighlightId}
        commentClicked={(id) => setActiveHighlightId(id)}
        highlights={deserializedHighlights}
      />
      <Container>
        {deserializedHighlights.map(({ rects, userId, id }) => (
          <Highlight
            key={id}
            color={getColorFromUserId(userId)}
            rects={rects}
            opacity={
              id === activeHighlightId
                ? "high"
                : id === hoveredHighlightId
                ? "medium"
                : "low"
            }
          />
        ))}
      </Container>
    </>
  );
}
