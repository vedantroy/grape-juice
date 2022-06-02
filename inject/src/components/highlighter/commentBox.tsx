import { HighlightId } from "@site/db/types.server";
import _ from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { Container } from "./container";
import { DeserializedPermanentHighlight } from "./sharedTypes";
import Comment, { COMMENT_BOX_WIDTH } from "./comment";
import invariant from "tiny-invariant";
import { Rect } from "src/utils/rect";

type CommentBoxProps = {
  highlights: DeserializedPermanentHighlight[];
  setActiveHighlightIdRef: (f: (h: HighlightId) => void) => void;
};

const COMMENT_BOX_OFFSET = 20;

function getCommentHandleX(container: Element) {
  const { right, width } = container.getBoundingClientRect();
  return Math.min(
    document.body.offsetWidth - COMMENT_BOX_WIDTH,
    right + width + COMMENT_BOX_OFFSET
  );
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

type IdToPosition = Record<HighlightId, { top: number }>;
function getActualCommentYs({
  XYs: beforeCopy,
  idToHeight,
}: {
  XYs: IdWithTopAndLeft[];
  idToHeight: IdToHeight;
}): IdToPosition {
  const XYs = [...beforeCopy];
  sortByYAndTieBreakonX(XYs);
  const XYsWithHeight = XYs.map((x) => ({ ...x, height: idToHeight[x.id] }));

  const placements = [XYsWithHeight[0]];
  const bottom = (x: IdWithDimensions) => x.top + x.height;

  // h-10 in tailwindcss
  const PADDING_BETWEEN_COMMENTS_PX = 40;

  function moveCommentBoxesUpIfNecessary() {
    for (let i = placements.length - 1; i > 0; --i) {
      const cur = placements[i];
      const aboveCur = i >= 0 ? placements[i - 1] : null;
      const shiftAboveCommentBy =
        aboveCur === null
          ? null
          : bottom(aboveCur) + PADDING_BETWEEN_COMMENTS_PX - cur.top;

      if (shiftAboveCommentBy !== null && shiftAboveCommentBy > 0) {
        aboveCur!!.top -= shiftAboveCommentBy;
      } else break;
    }
  }

  for (let i = 1; i < XYsWithHeight.length; i++) {
    placements.push(XYsWithHeight[i]);
    moveCommentBoxesUpIfNecessary();
  }

  const idToY: IdToPosition = {};
  for (const p of placements) {
    idToY[p.id] = { top: p.top };
  }
  return idToY;
}

export default function ({
  highlights,
  setActiveHighlightIdRef,
}: CommentBoxProps) {
  invariant(highlights.length > 0, "no highlights");

  const [activeHighlightId, setActiveHighlightId] =
    useState<HighlightId | null>(null);

  useEffect(() => {
    setActiveHighlightIdRef(setActiveHighlightId);
  }, []);

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

  const [idToHeight, setIdToHeight] = useState<IdToHeight>({});
  const [idToPos, setIdToPos] = useState<IdToPosition>({});

  useEffect(
    () => {
      if (_.keys(idToHeight).length !== highlights.length) return;

      const idToY = getActualCommentYs({
        XYs: highlightXYs,
        idToHeight,
      });
      setIdToPos(idToY);
    },
    // No need to include `highlights`, or any information that is calculated
    // from `highlights` because any change in `highlights` will always result
    // in `idToHeight` being changed *last*
    [idToHeight]
  );

  const positionsCalculated = !_.isEmpty(idToPos);

  return (
    <Container>
      {highlights.map((h) => (
        <Comment
          userId={h.userId}
          onHeightChanged={(newHeight) =>
            setIdToHeight((old) => ({ ...old, [h.id]: newHeight }))
          }
          key={h.id}
          visible={positionsCalculated}
          x={rightMostCommentHandleOffset}
          y={idToPos[h.id]?.top}
        />
      ))}
    </Container>
  );
}
