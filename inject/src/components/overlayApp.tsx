// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React, { useCallback, useEffect, useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css";
// This is a reminder of an embarassing mistake:
// I spent a while trying to make *everything* work in the shadow DOM
// when I could have just injected toast styles into the shadow DOM and
// in the main DOM.

// import toastStyles from "../generated/react-toastify.inlined.css?inline";
// We still need to inject some global styles b/c
// react-toastify generates SVGs that use global CSS variables
import "../generated/react-toastify.vars.css";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { pack, unpack } from "msgpackr";
import { finder } from "@medv/finder";

import {
  Codes,
  Message,
  SubscribeMessage,
  SelectionMessage,
  ClearSelectionMessage,
  CreateHighlightMessage,
  HighlightCreatedMessage,
  SubscribedMessage,
  UpdateHighlightRepliesMessage,
} from "@site/websocket/protocol";

// https://github.com/vitejs/vite/issues/3246
import twStyles from "./shadowDOM.css?inline";
import { Rangee } from "rangee";
import TransientHighlighter, {
  TransientHighlighterProps,
} from "./highlighter/transientHighlighter";
import { getSelectionUpdate, Selection } from "src/utils/selection";
import { getUserIdOtherwiseCreateNew } from "src/utils/userId";
import HighlightButton, { ButtonStatus } from "./highlightButton";
import _ from "lodash-es";
import PermanentHighlighter, {
  PermanentHighlighterProps,
} from "./highlighter/permanentHighlighter";
import { HighlightId, PostId, ReplyId, UserId } from "@site/db/types.server";
import { HighlightWithActiveRanges } from "./highlighter/sharedTypes";
import CursorChat from "./cursor-chat/react";
import { WEBSOCKET_URL, CHANNEL, CURSOR_CHAT_URL, isDebugMode } from "./env";

// I hate the pattern of stuff something inside a "go" function
// This is my solution
function runAsync(f: Function) {
  return () => {
    f();
  };
}

const HIGHLIGHT_BUTTON_OFFSET = 50;
const rangee = new Rangee({ document });

const HighlightStatus = {
  Ready: "ready",
  Submitting: "submitting",
} as const;
type HighlightStatus = typeof HighlightStatus[keyof typeof HighlightStatus];

const ToastIds = {
  [ReadyState.CLOSED]: "closed",
  [ReadyState.OPEN]: "open",
  [ReadyState.CLOSING]: "closing",
  [ReadyState.UNINSTANTIATED]: "uninstantiated",
  [ReadyState.CONNECTING]: "connecting",
} as const;

function dismissAllToasts(/*id: ReadyState*/) {
  _.toPairs(ToastIds)
    //.filter(([key, _]) => id.toString() !== key)
    .forEach(([_, value]) => {
      toast.dismiss(value);
    });
}

const App = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(WEBSOCKET_URL, {
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 5_000,
  });

  useEffect(() => {
    dismissAllToasts();
    const toastId = ToastIds[readyState];
    const opts = {
      id: toastId,
      hideProgressBar: true,
      autoClose: 3_000,
    };
    if (isDebugMode()) {
      console.log(`Dismissing all toasts`);
      console.log(`Displaying toast with id: ${opts.id}`);
    }
    switch (readyState) {
      case ReadyState.CONNECTING:
        toast.info("Connecting to websocket...", opts);
        break;
      case ReadyState.OPEN:
        toast.success("Connected to websocket", opts);
        break;
      case ReadyState.CLOSING:
        toast.error("Websocket is closing", opts);
        break;
      case ReadyState.CLOSED:
        toast.error("Websocket closed", opts);
        break;
    }
  }, [readyState]);

  const [highlightStatus, setHighlightStatus] = useState<HighlightStatus>(
    HighlightStatus.Ready
  );
  const [permanentHighlights, setPermanentHighlights] = useState<
    PermanentHighlighterProps["highlights"]
  >({});
  const [transientHighlights, setTransientHighlights] = useState<
    TransientHighlighterProps["highlights"]
  >({});

  const [selection, setSelection] = useState<Selection | null>(null);
  const [userId, setUserId] = useState<UserId | null>(null);

  const handleSelection = useCallback(
    (msg: SelectionMessage) => {
      const { range, userId: highlightUserId } = msg;
      const ranges = rangee.deserializeAtomic(range);
      setTransientHighlights((highlights) => ({
        ...highlights,
        [highlightUserId]: { ranges },
      }));
    },
    [userId]
  );

  const handleClearSelection = useCallback(
    (msg: ClearSelectionMessage) => {
      const { userId: highlightUserId } = msg;
      setTransientHighlights((highlights) =>
        _.pickBy(highlights, (_, userId) => userId !== highlightUserId)
      );
    },
    [userId]
  );

  const handleHighlightCreated = useCallback(
    (msg: HighlightCreatedMessage) => {
      const {
        userId: highlightUserId,
        range,
        id,
        containerSelector,
        reply,
      } = msg;

      const highlight: HighlightWithActiveRanges = {
        id: id as HighlightId,
        ranges: rangee.deserializeAtomic(range),
        userId: highlightUserId as UserId,
        containerSelector,
        replies: [
          { ...reply, userId: reply.userId as UserId, id: reply.id as ReplyId },
        ],
      };

      setPermanentHighlights((highlights) => ({
        ...highlights,
        [id]: highlight,
      }));
    },
    [userId]
  );

  const handleUpdateHighlightReplies = useCallback(
    (msg: UpdateHighlightRepliesMessage) => {
      const { highlightId, replies } = msg;

      // TODO: Somewhat of a performance hit here
      // b/c we're updating the highlights object, which causes
      // re-calculation of all highlights even though we really just need
      // to update the replies

      setPermanentHighlights((highlights) => {
        const oldHighlight = highlights[highlightId as HighlightId];
        return { ...highlights, [highlightId]: { ...oldHighlight, replies } };
      });
    },
    [userId]
  );

  const handleSubscribed = useCallback(
    (msg: SubscribedMessage) => {
      const { highlights: newestHighlights } = msg;
      const deserialized: PermanentHighlighterProps["highlights"] = _.mapValues(
        newestHighlights,
        ({ range, ...rest }) => ({
          ...rest,
          ranges: rangee.deserializeAtomic(range),
        })
      ) as PermanentHighlighterProps["highlights"];
      setPermanentHighlights((highlights) => ({
        // TODO: Not sure if we need the spread of the old highlights here
        ...highlights,
        ...deserialized,
      }));
    },
    [userId]
  );

  useEffect(
    runAsync(async () => {
      const noMessageOrUserIdNotLoaded = !lastMessage || !userId;
      if (noMessageOrUserIdNotLoaded) return;

      const bytes = new Uint8Array(await lastMessage!!.data.arrayBuffer());
      const unvalidated = unpack(bytes);
      const msg = Message.parse(unvalidated);

      const sentDirectlyToUs = !(msg as any).userId;
      const wasTriggeredByUs =
        sentDirectlyToUs || (msg as any).userId === userId;

      if (
        wasTriggeredByUs &&
        (msg.kind === Codes.Selection || msg.kind === Codes.ClearSelection)
      )
        return;

      switch (msg.kind) {
        case Codes.Selection:
          handleSelection(msg);
          break;
        case Codes.ClearSelection:
          handleClearSelection(msg);
          break;
        case Codes.HighlightCreated:
          if (wasTriggeredByUs) {
            // This is prone to unituitive behavior
            // if the submission is taking a while (e.g 10 seconds)
            // the user highlights something else in the meantime
            window.getSelection()?.empty();
            setHighlightStatus(HighlightStatus.Ready);
          }
          handleHighlightCreated(msg);
          break;
        case Codes.Subscribed:
          handleSubscribed(msg);
          break;
        case Codes.UpdateHighlightReplies:
          handleUpdateHighlightReplies(msg);
          break;
        default:
          console.log(`Unexpected message: ${msg.kind}`);
      }
    }),
    // Values inside a useEffect are always fresh,
    // so we don't need to include *all* things that could change
    // See: https://stackoverflow.com/questions/72428900
    [lastMessage?.data, userId]
  );

  useEffect(() => {
    const onSelection = () => setSelection(getSelectionUpdate(rangee));
    document.addEventListener("selectionchange", onSelection);
    const go = async () => setUserId(await getUserIdOtherwiseCreateNew());
    go();

    return () => {
      document.removeEventListener("selectionchange", onSelection);
    };
  }, []);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) return;
    const msg: SubscribeMessage = {
      kind: Codes.Subscribe,
      postId: CHANNEL,
    };
    sendMessage(pack(msg), true);
  }, [readyState === ReadyState.OPEN]);

  useEffect(() => {
    if (!userId) return;
    //if (selection?.serializedRange === "QAA==") return;
    const emptySelection = selection === null;
    const msg = {
      kind: emptySelection ? Codes.ClearSelection : Codes.Selection,
      postId: CHANNEL,
      userId,
      ...(!emptySelection && { range: selection.serializedRange }),
    } as SelectionMessage | ClearSelectionMessage;
    sendMessage(pack(msg), false);
  }, [selection?.serializedRange, userId]);

  const submitSelection = useCallback(() => {
    if (!userId || !selection) return;

    setHighlightStatus(HighlightStatus.Submitting);
    const selector = finder(selection.container, {
      // try to find super short selector
      // by raising number of tries
      maxNumberOfTries: 3000,
    });

    const commentText = prompt("Write your commment");
    const userClickedCancel = commentText === null;
    if (userClickedCancel) {
      setHighlightStatus(HighlightStatus.Ready);
      return;
    }

    // TODO: We should maybe try the selector (unless
    // the library guarantees the selector is valid ??)

    const msg: CreateHighlightMessage = {
      kind: Codes.CreateHighlight,
      postId: CHANNEL,
      userId,
      range: selection.serializedRange,
      containerSelector: selector,
      initialReply: commentText,
    };
    sendMessage(pack(msg), false);
    if (isDebugMode()) {
      console.log(`Sent message: ${JSON.stringify(msg)}`);
    }
  }, [selection, userId]);

  return (
    <>
      <div style={{ all: "initial" }}>
        <ReactShadowRoot>
          <style type="text/css">{twStyles}</style>
          <style type="text/css">{toastStyles}</style>
          {selection ? (
            <HighlightButton
              status={
                !userId
                  ? ButtonStatus.Initializing
                  : highlightStatus === HighlightStatus.Submitting
                  ? ButtonStatus.Submitting
                  : ButtonStatus.Ready
              }
              x={selection.x + HIGHLIGHT_BUTTON_OFFSET}
              y={selection.y}
              onClick={submitSelection}
            />
          ) : null}
          {userId && (
            <PermanentHighlighter
              userId={userId}
              postId={CHANNEL as PostId}
              highlights={permanentHighlights}
            />
          )}
          <TransientHighlighter highlights={transientHighlights} />
          <ToastContainer position="bottom-right" />
        </ReactShadowRoot>
      </div>
      <div style={{ all: "initial" }}>
        {userId && (
          <CursorChat
            userId={userId as UserId}
            websocketUrl={CURSOR_CHAT_URL}
          />
        )}
      </div>
    </>
  );
};

export default App;
