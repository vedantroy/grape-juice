import { HighlightId } from "@site/db/types.server";
import _, { xor } from "lodash-es";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Container } from "./container";
import { DeserializedPermanentHighlight } from "./sharedTypes";
import Comment from "./comment";
import invariant from "tiny-invariant";
import { PermanentHighlight } from "./permanentHighlighter";

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

function getIdealY(rects: Rect[]): number {
  const min = _.min(rects.map((r) => r.top));
  // TODO: Don't use an invariant, just skip
  invariant(min !== undefined, `no rects`);
  return min;
}

function getHighlightTopAndLeft(rects: Rect[]): { left: number; top: number } {
  let left = Infinity;
  let top = Infinity;
  for (const rect of rects) {
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
  }

  invariant(left !== Infinity, `no rects`);
  invariant(top !== Infinity, `no rects`);

  return { left, top };
}

type IdToHeight = Record<HighlightId, number>;
type IdWithTopAndLeft = {
  id: HighlightId;
  top: number;
  left: number;
};
type IdWithDimensions = IdWithTopAndLeft & { height: number };

function sortByYAndTieBreakonX(xs: IdWithTopAndLeft[]) {
  xs.sort((a, b) => {
    // > 0	sort a after b
    // < 0	sort a before b
    // === 0	keep original order of a and b
    const sameY = a.top === b.top;
    return sameY ? a.left - b.left : a.top - b.top;
  });
}

function getActualYs({
  XYs: beforeCopy,
  idToHeight,
}: {
  XYs: IdWithTopAndLeft[];
  idToHeight: IdToHeight;
}): Record<HighlightId, number> {
  const XYs = [...beforeCopy];
  sortByYAndTieBreakonX(XYs);
  const XYsWithHeight = XYs.map((x) => ({ ...x, height: idToHeight[x.id] }));

  const placements = [XYsWithHeight[0]];
  const bottom = (x: IdWithDimensions) => x.top + x.height;

  const PADDING_BETWEEN_COMMENTS_PX = 20;

  function shiftUp(by: number) {
    for (let i = placements.length - 1; i > 0; --i) {
      const cur = placements[i];
      const prev = i >= 0 ? placements[i - 1] : null;
      cur.top -= by;
      const noCommentAboveCur = prev === null;
      if (noCommentAboveCur) return;
      const minimumTop = bottom(prev) + PADDING_BETWEEN_COMMENTS_PX;
      if (minimumTop > cur.top) {
        const overshoot = minimumTop - cur.top;
        by = overshoot;
      } else break;
    }
  }

  for (let i = 1; i < XYsWithHeight.length; i++) {
    const prev = XYsWithHeight[i - 1];
    const cur = XYsWithHeight[i];

    if (bottom(prev) + PADDING_BETWEEN_COMMENTS_PX < cur.top) {
      placements.push(cur);
    } else {
      // call shiftup
    }
  }

  return {};
}

export default function ({ highlights }: CommentBoxProps) {
  invariant(highlights.length > 0, "no highlights");

  const rightMostCommentHandleOffset = useMemo(
    () => _.max(highlights.map((h) => getCommentHandleX(h.container))),
    [highlights]
  ) as number;

  const highlightXYs = useMemo(
    () =>
      highlights.map(({ rects, id }) => ({
        ...getHighlightTopAndLeft(rects),
        id,
      })),
    [highlights]
  );

  const [showComments, setShowComments] = useState(false);

  const idToElement = useRef<Record<HighlightId, HTMLElement>>({});
  const [idToHeight, setIdToHeight] = useState<IdToHeight>({});

  // onChange => update comment heights
  // usEffect => reflow

  useEffect(
    () => {
      if (_.keys(idToHeight).length !== highlights.length) return;

      //const heights = highlights.map((h) => {
      //  const height = idToHeight[h.id];
      //  invariant(height !== undefined, `missing height for ${h.id}`);
      //  return height;
      //});

      const actualYs = getActualYs({
        XYs: highlightXYs,
        idToHeight,
      });

      console.log(idToHeight);
    },
    // Don't include `idealYs` b/c if new highlights are added,
    // idToHeight will be changed anyways
    [idToHeight]
  );

  return (
    <Container>
      {highlights.map((h) => (
        <Comment
          onHeightChanged={(newHeight) =>
            setIdToHeight((old) => ({ ...old, [h.id]: newHeight }))
          }
          key={h.id}
          visible={showComments}
          x={rightMostCommentHandleOffset}
          y={100}
        />
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
