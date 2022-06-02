import clsx from "clsx";
import React, { useEffect } from "react";
import useResizeObserver from "use-resize-observer";
import tw from "@site/components/tw-styled";
import { getColorFromUserId } from "src/utils/userId";
import { HighlightId, UserId } from "@site/db/types.server";

type CommentProps = {
  x: number;
  y: number;
  visible: boolean;
  userId: UserId;
  onHeightChanged: (height: number) => void;
  onClick: React.MouseEventHandler;
  isActive: boolean;
  // For debugging
  highlightId: HighlightId;
};

const DEFAULT_HEIGHT = -1;
// w-60 in tailwind
export const COMMENT_BOX_WIDTH = 240;
// p-2 in tailwind
const COMMENT_BOX_PADDING = 8;

const HeaderRow = tw.div(`
    flex
    flex-row
    items-center
    text-base
    gap-x-2
`);

const ColorBadge = tw.div(`
    rounded
    w-2
    h-2
`);

export default function ({
  x,
  y,
  visible,
  onHeightChanged,
  userId,
  onClick,
  highlightId,
  isActive,
}: CommentProps) {
  const { ref, height = DEFAULT_HEIGHT } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (height === DEFAULT_HEIGHT) return;
    onHeightChanged(height);
  }, [height]);

  return (
    <div
      onClick={onClick}
      ref={ref}
      id="comment-test"
      className={clsx(
        "font-sans absolute shadow rounded z-50 bg-white flex flex-col items-stretch",
        !visible && "invisible",
        isActive && "scale-110"
      )}
      style={{
        top: y,
        left: x,
        width: COMMENT_BOX_WIDTH,
        padding: COMMENT_BOX_PADDING,
        transitionProperty: "top, left, transform",
        // Tailwind CSS transition function
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "300ms",
      }}
    >
      <HeaderRow>
        <ColorBadge
          style={{ background: getColorFromUserId(userId) }}
        ></ColorBadge>
        <div className="font-semibold text-base">Anon. Badger</div>
        <div className="ml-auto font-normal text-gray-400">9y ago</div>
      </HeaderRow>
      <div
        style={{
          height: 1,
          marginLeft: -COMMENT_BOX_PADDING,
          marginRight: -COMMENT_BOX_PADDING,
        }}
        className="bg-gray-300"
      ></div>
      <div className="mt-2 px-4">{highlightId}</div>
      <div className="text-right text-gray-400 text-sm">REPLY</div>
    </div>
  );
}
