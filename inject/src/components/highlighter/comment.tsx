import clsx from "clsx";
import React, { Fragment, useEffect, useState } from "react";
import useResizeObserver from "use-resize-observer";
import tw from "@site/components/tw-styled";
import { getColorFromUserId } from "src/utils/userId";
import { HighlightId, Reply, UserId } from "@site/db/types.server";
import TextAreaAutosize from "react-textarea-autosize";

type CommentProps = {
  x: number;
  y: number;
  visible: boolean;
  userId: UserId;
  onHeightChanged: (height: number) => void;
  onClick: (h: HighlightId | null) => void;
  isActive: boolean;
  // For debugging
  highlightId: HighlightId;
  replies: Array<Reply>;
};

const DEFAULT_HEIGHT = -1;
// w-60 in tailwind
export const COMMENT_BOX_WIDTH = 280;
//export const COMMENT_BOX_WIDTH = 240;
// p-2 in tailwind
const COMMENT_BOX_PADDING = 8;

const HeaderRow = tw.div(`
    flex
    flex-row
    items-center
    text-base
    gap-x-2
    pt-4
    px-2
`);

const ColorBadge = tw.div(`
    rounded
    w-2
    h-2
`);

const Comment = tw.div(`
  font-sans
	absolute
	shadow
  rounded
	hover:shadow-lg 
 	hover:scale-110
	cursor-pointer 
	z-50
	bg-white
	flex
	flex-col
	items-stretch
`);

const Divider = ({ fullWidth }: { fullWidth: boolean }) => (
  <div
    style={{
      height: 2,
    }}
    className={clsx("bg-gray-300", !fullWidth && "mx-3")}
  ></div>
);

const CANCEL_BUTTON_TYPE = "cancel-reply";
const SUBMIT_BUTTON_TYPE = "submit-reply";

export default function ({
  x,
  y,
  visible,
  onHeightChanged,
  userId,
  onClick,
  highlightId,
  isActive,
  replies,
}: CommentProps) {
  const { ref, height = DEFAULT_HEIGHT } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (height === DEFAULT_HEIGHT) return;
    onHeightChanged(height);
  }, [height]);

  const [text, setText] = useState("");

  const showReplyBox = text !== "" || isActive;

  return (
    <Comment
      onClick={(e) => {
        // Necessary because we don't want the document's
        // onClick listener to be triggered because that will
        // set the active highlight to null.
        e.stopPropagation();

        //@ts-expect-error We don't want `currentTarget`, we want
        // the actual element that was clicked
        const buttonType = e.target.getAttribute("data-button-type");
        if (buttonType === CANCEL_BUTTON_TYPE) {
          setText("");
          onClick(null);
        } else if (buttonType === SUBMIT_BUTTON_TYPE) {
          console.log("submi!");
        } else {
          onClick(highlightId);
        }
      }}
      innerRef={ref}
      className={clsx(
        !visible && "invisible",
        isActive && "scale-110 shadow-lg"
      )}
      style={{
        top: y,
        left: x,
        width: COMMENT_BOX_WIDTH,
        // TODO: Maybe bad to have exterior padding?
        // padding: COMMENT_BOX_PADDING,
        transitionProperty: "top, left, transform, box-shadow",
        // Tailwind CSS transition function
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "300ms",
      }}
    >
      {replies.map((r, idx) => (
        <Fragment key={r.id}>
          <HeaderRow>
            <ColorBadge style={{ background: getColorFromUserId(userId) }} />
            <div className="font-semibold text-base">Anon. Badger</div>
            <div className="font-normal text-gray-400"> · 9y ago</div>
          </HeaderRow>
          <p className="mt-2 px-4 pb-4 break-words">{highlightId}</p>
          {idx < replies.length - 1 ? (
            <Divider fullWidth={false} />
          ) : (
            showReplyBox && <Divider fullWidth={true} />
          )}
        </Fragment>
      ))}
      {showReplyBox && (
        <div className="py-4 px-2 w-full">
          <TextAreaAutosize
            onChange={(e) => setText(e.target.value)}
            value={text}
            style={{ resize: "none" }}
            placeholder="Reply here..."
            className="rounded border-gray-300 border-2 w-full"
          />
          <div className="flex flex-row mt-4 gap-x-4">
            <button
              data-button-type={SUBMIT_BUTTON_TYPE}
              className="py-2 px-4 font-semibold rounded bg-blue-600 text-white"
            >
              Reply
            </button>
            <button
              data-button-type={CANCEL_BUTTON_TYPE}
              className="border-2 py-2 px-4 font-semibold rounded text-blue-600 bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Comment>
  );
}
