import { HighlightId, PageId, ReplyId, UserId } from "@site/db/types.server";
import _ from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { Container } from "./container";
import { InstantiatedHighlight } from "./sharedTypes";
import Comment, { COMMENT_BOX_WIDTH } from "./comment";
import invariant from "tiny-invariant";
import { Rect } from "src/utils/rect";

type CommentBoxProps = {
  highlights: InstantiatedHighlight[];
  commentClicked: (highlightId: HighlightId | null) => void;
  activeHighlightId: HighlightId | null;
  postId: PageId;
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
  idealXYs,
  idToHeight,
  activeHighlightId,
}: {
  idealXYs: IdWithTopAndLeft[];
  idToHeight: IdToHeight;
  activeHighlightId: HighlightId | null;
}): IdToPosition {
  const XYs = _.cloneDeep(idealXYs);
  sortByYAndTieBreakonX(XYs);
  const XYsWithHeight = XYs.map((x) => ({ ...x, height: idToHeight[x.id] }));

  const bottom = (x: IdWithDimensions) => x.top + x.height;

  // h-10 in tailwindcss
  const PADDING_BETWEEN_COMMENTS_PX = 40;

  function moveCommentBoxesUpIfNecessary(curIdx: number) {
    for (let i = curIdx; i > 0; --i) {
      const cur = XYsWithHeight[i];
      const aboveCur = i >= 0 ? XYsWithHeight[i - 1] : null;
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
    moveCommentBoxesUpIfNecessary(i);
  }

  if (activeHighlightId) {
    const idx = XYsWithHeight.findIndex(({ id }) => id === activeHighlightId);
    const activePlacement = XYsWithHeight[idx];
    const idealPosition = idealXYs.find(({ id }) => id === activeHighlightId)!;
    const shiftBy = idealPosition.top - activePlacement.top;

    if (shiftBy !== 0) {
      XYsWithHeight.forEach((p) => (p.top += shiftBy));
    }
  }

  const idToY: IdToPosition = {};
  for (const pos of XYsWithHeight) {
    idToY[pos.id] = { top: pos.top };
  }
  return idToY;
}

const ACTIVE_INDENT = 40;

export default function ({
  highlights,
  commentClicked,
  activeHighlightId,
  postId,
}: CommentBoxProps) {
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

  const [idToHeight, setIdToHeight] = useState<IdToHeight>({});
  const [idToPos, setIdToPos] = useState<IdToPosition>({});

  const [replyBoxHiddenHighlightId, setReplyBoxHiddenHighlightId] =
    useState<HighlightId | null>(null);

  useEffect(
    () => {
      if (_.keys(idToHeight).length !== highlights.length) return;

      const positionsNotInitialized = _.isEmpty(idToPos);
      if (positionsNotInitialized || activeHighlightId) {
        const idToY = getActualCommentYs({
          idealXYs: highlightXYs,
          idToHeight,
          activeHighlightId,
        });
        setIdToPos(idToY);
      } else if (!positionsNotInitialized) {
        // PROBLEM SOLVED: Without this, when we hide the reply box on a comment by
        // clicking "cancel" or clicking outside of the comment box (& the reply box
        // is empty) there is an unnatural gap between the comment box and the the one
        // below it.

        // WHY: We avoid recalculating positions in that scenario in order to
        // merely defocus the current highlight instead of resetting all comment
        // box positions. But, the previous positions included the comment box *with*
        // reply box attached.

        const idToY = getActualCommentYs({
          idealXYs: highlightXYs,
          idToHeight,
          activeHighlightId: replyBoxHiddenHighlightId,
        });
        setIdToPos(idToY);
      }
    },
    // No need to include `highlights`, or any information that is calculated
    // from `highlights` because any change in `highlights` will always result
    // in `idToHeight` being changed *last*
    [idToHeight, activeHighlightId, replyBoxHiddenHighlightId]
  );

  const positionsCalculated = !_.isEmpty(idToPos);

  return (
    <Container>
      {highlights.map((h) => (
        <Comment
          key={h.id}
          replies={h.replies}
          highlightId={h.id}
          postId={postId}
          onHighlightId={commentClicked}
          onHideReplyBox={() => setReplyBoxHiddenHighlightId(h.id)}
          userId={h.userId}
          onHeightChanged={(newHeight) =>
            setIdToHeight((old) => ({ ...old, [h.id]: newHeight }))
          }
          visible={positionsCalculated}
          isActive={activeHighlightId === h.id}
          x={
            activeHighlightId === h.id
              ? rightMostCommentHandleOffset - ACTIVE_INDENT
              : rightMostCommentHandleOffset
          }
          y={idToPos[h.id]?.top}
        />
      ))}
    </Container>
  );
}
