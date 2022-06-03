import clsx from "clsx";
import React, { Fragment, useEffect, useRef, useState } from "react";
import useResizeObserver from "use-resize-observer";
import tw from "@site/components/tw-styled";
import { getAnimalNameFromUserId, getColorFromUserId } from "src/utils/userId";
import { HighlightId, PageId, Reply, UserId } from "@site/db/types.server";
import TextAreaAutosize from "react-textarea-autosize";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ReplyCreatedPayload,
  UpdateHighlightRepliesMessage,
} from "@site/websocket/protocol";
import { unpack } from "msgpackr";

type CommentProps = {
  x: number;
  y: number;
  visible: boolean;
  userId: UserId;
  onHeightChanged: (height: number) => void;
  onHighlightId: (h: HighlightId | null) => void;
  onHideReplyBox: () => void;
  isActive: boolean;
  // For debugging
  highlightId: HighlightId;
  postId: PageId;
  replies: Array<Reply>;
};

const DEFAULT_HEIGHT = -1;
export const COMMENT_BOX_WIDTH = 280;

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

// Taken from flowbyte
const Spinner = () => (
  <svg
    role="status"
    className="inline w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

export default function ({
  x,
  y,
  visible,
  onHeightChanged,
  userId,
  onHighlightId,
  highlightId,
  isActive,
  replies,
  onHideReplyBox,
  postId,
}: CommentProps) {
  const { ref, height = DEFAULT_HEIGHT } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (height === DEFAULT_HEIGHT) return;
    onHeightChanged(height);
  }, [height]);

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const showReplyBox = text !== "" || isActive;

  const mountRef = useRef(false);
  useEffect(() => {
    if (mountRef.current && !showReplyBox) {
      onHideReplyBox();
    }
    mountRef.current = true;
  }, [showReplyBox]);

  return (
    <Comment
      onClick={async (e) => {
        // Necessary because we don't want the document's
        // onClick listener to be triggered because that will
        // set the active highlight to null.
        e.stopPropagation();

        //@ts-expect-error We don't want `currentTarget`, we want
        // the actual element that was clicked
        const buttonType = e.target.getAttribute("data-button-type");
        if (buttonType === CANCEL_BUTTON_TYPE) {
          setText("");
          onHighlightId(null);
        } else if (buttonType === SUBMIT_BUTTON_TYPE) {
          if (text === "") return;
          setSubmitting(true);

          const data: ReplyCreatedPayload = {
            reply: {
              text,
              userId,
            },
            postId,
            highlightId,
          };

          let response: Response;
          try {
            response = await fetch(
              "http://localhost:3000/api/highlight/reply",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              }
            );
          } catch (e) {
            console.log(e);
            return;
          }

          const resp = UpdateHighlightRepliesMessage.parse(
            unpack(new Uint8Array(await response.arrayBuffer()))
          );
          setSubmitting(false);
          setText("");
        } else {
          onHighlightId(highlightId);
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
        transitionProperty: "top, left, transform, box-shadow",
        // Tailwind CSS transition function
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "300ms",
      }}
    >
      {replies.map((r, idx) => (
        <Fragment key={r.id}>
          <HeaderRow>
            <ColorBadge style={{ background: getColorFromUserId(r.userId) }} />
            <div className="font-semibold text-base capitalize">
              Anon. {getAnimalNameFromUserId(r.userId)}
            </div>
            <div className="font-normal text-gray-400 whitespace-nowrap">
              ·{" "}
              {formatDistanceToNowStrict(r.date, {
                addSuffix: true,
              })
                .replace("minutes", "mins")
                .replace("seconds", "secs")}
            </div>
          </HeaderRow>
          <p className="mt-2 px-4 pb-4 break-words">{r.text}</p>
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
          <div className="mt-4">
            {!submitting && (
              <div className="flex flex-row gap-x-4">
                <button
                  data-button-type={SUBMIT_BUTTON_TYPE}
                  className={clsx(
                    "py-2 px-4 font-semibold rounded bg-blue-600 text-white",
                    text === "" && "cursor-not-allowed"
                  )}
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
            )}
            {submitting && (
              <div
                className={
                  "flex flex-row items-center justify-center py-2 px-4 font-semibold rounded bg-blue-600 text-white cursor-wait w-24"
                }
              >
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </Comment>
  );
}
