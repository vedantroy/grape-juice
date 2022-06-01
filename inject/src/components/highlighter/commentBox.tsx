import { HighlightId } from "@site/db/types.server";
import clsx from "clsx";
import _ from "lodash-es";
import React, { useLayoutEffect, useRef } from "react";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { Container } from "./container";
import { DeserializedPermanentHighlight } from "./sharedTypes";

type Rect = { left: number; top: number; width: number; height: number };
const right = (r: Rect) => r.left + r.width;
const bottom = (r: Rect) => r.top + r.height;
const fromDOMRect = (r: DOMRect) => ({
  left: r.left,
  top: r.top,
  width: r.width,
  height: r.height,
});

type CommentBoxProps = {
  highlights: DeserializedPermanentHighlight[];
};

const COMMENT_BOX_OFFSET = 20;
const COMMENT_BOX_WIDTH = 30;

function getCommentHandleX(container: Element) {
  const { right, width } = container.getBoundingClientRect();
  return Math.min(
    document.body.offsetWidth - COMMENT_BOX_WIDTH,
    right + width + COMMENT_BOX_OFFSET
  );
}

function getIdealY(rects: Rect[]) {
  return _.min(rects.map((r) => r.top));
}

const COMMENT_CLASS = "comment-container";

export default function ({ highlights }: CommentBoxProps) {
  const rightMostCommentHandleOffset = useMemo(
    () => _.max(highlights.map((h) => getCommentHandleX(h.container))),
    [highlights]
  );

  const idealYs = useMemo(
    () => highlights.map((h) => getIdealY(h.rects)),
    [highlights]
  );

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const [showComments, setShowComments] = useState(false);

  //const [idToElement, setIdToElement] = useState<
  //  Record<HighlightId, HTMLElement> & { size: number }
  //>({ size: 0 });

  const idToElement = useRef<Record<HighlightId, HTMLElement>>({});
  const [idToHeight, setIdToHeight] = useState<Record<HighlightId, number>>({});

  const [commentBoxHeights, setCommentBoxHeights] = useState<number[]>([]);

  // Options:
  // 1. do useLayoutEffect & gather all heights
  //   - we set heights & run reflow algorithim
  //   - whenever the height of a child element changes, we also call the function
  //  that useLayoutEffect is running
  // 2. use resize observer on all the children (we might have to do this anyway)
  // whenever a dimension changes, update the commentBoxHeights
  //   run the reflow algorithim
  // seems like option 2 is better because we need to use the resize observer
  // anyways. Option 1 has the advantage of collecting the heights in one pass
  // but ... I don't think that's a bottleneck for anything because we
  // only run the reflow algorithim if once all comments have been rendered

  // TODO: This could just be a `useEffect` instead maybe?
  useLayoutEffect(() => {
    if (!containerRef) return;

    const commentElements = containerRef.getElementsByClassName(COMMENT_CLASS);
    const allCommentsRendered = commentElements.length === highlights.length;
    if (!allCommentsRendered) return;

    // whenever the highlights array changes, we update
  }, [highlights, containerRef]);

  useEffect(() => {
    if (_.keys(idToHeight).length !== highlights.length) return;
  }, [idToHeight]);

  return (
    <Container ref={(ref) => ref && setContainerRef(ref)}>
      {highlights.map((h) => (
        <div
          key={h.id}
          //ref={(ref) => {
          //  console.log("setting");
          //  if (!ref) {
          //    delete idToElement.current[h.id];
          //    setIdToHeight((old) => _.pickBy(old, (_, k) => k !== h.id));
          //    return;
          //  }
          //  idToElement.current[h.id] = ref;
          //  setIdToHeight((old) => ({
          //    ...old,
          //    [h.id]: ref.clientHeight,
          //  }));
          //}}
          className={clsx(
            "absolute z-50 bg-black h-5 w-5",
            !showComments && "hidden",
            COMMENT_CLASS
          )}
          data-highlight-id={h.id}
          style={{ top: 100, left: rightMostCommentHandleOffset }}
        ></div>
      ))}
    </Container>
  );
}

/*
export default function ({ highlights }: PermanentHighlighterProps) {
  const leftCoord = getLeftCoord(highlights);

  function getIdealCoords(xs) {
    return xs.map((x) => x.boundingRect().right);
  }

  const idealCoords = getIdealCoords(highlights);

  const actualCoords = getActualCoords(highlights, activeHighlight);

  function getActualCoords(xs) {
    function shiftUp(xs, idx, amt) {
      for (let i = xs.length; i > 0; i--) {
        const cur = xs[i],
          prev = xs[i - 1] || null;
        xs.placement -= amt;
        if (prev == null) return;
        if (cur.start > prev.end) amt = cur.start - prev.end + PADDING;
      }
    }

    let placements = [];
    for (let i = 0; i < xs.length; i++) {
      let prev = placements[i - 1];
      if (prev.height + prev.placement > idealCoords[i]) {
        shiftUp(placements, i, prev.height + prev.placement - idealCoords[i]);
      }
    }
  }

  return (
    <div>
      {highlights.map((h) => (
        <div onClick={setActiveHighlight(id)}></div>
      ))}
    </div>
  );

  // coords of all elements -> max(X)
  // sort by preferred Y
  // for elem:
  //  if preffered Y not occupied, place @ preffered Y
  //  shift up previous elements, place @ preffered Y
  //  shift(elems)
  //
}
*/
