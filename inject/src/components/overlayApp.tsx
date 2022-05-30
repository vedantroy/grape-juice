// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React, { useCallback, useEffect, useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { pack, unpack } from "msgpackr";
import clsx from "clsx";

import tw from "@site/components/tw-styled";
import {
  Codes,
  Message,
  SubscribeMessage,
  SelectionMessage,
  ClearSelectionMessage,
} from "@site/websocket/protocol";

// https://github.com/vitejs/vite/issues/3246
import styles from "../index.css?inline";
import { Rangee } from "rangee";
import ActiveHighlighter, { HighlighterProps } from "./highlighter";
import { getSelectionUpdate, Selection } from "src/utils/selection";
import { getUserIdOtherwiseCreateNew } from "src/utils/userId";
import HighlightButton from "./highlightButton";
import _ from "lodash-es";

// I hate the pattern of stuff something inside a "go" function
// This is my solution
function runAsync(f: Function) {
  return () => {
    f();
  };
}

const HIGHLIGHT_BUTTON_OFFSET = 50;
const rangee = new Rangee({ document });

const reconnectToastId = "reconnect-toast";
const connectingToastId = "connect-toast";

const CHANNEL = "foobar";

const App = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:9001/${CHANNEL}`,
    {}
  );

  const [highlights, setHighlights] = useState<HighlighterProps["highlights"]>(
    {}
  );
  const [selection, setSelection] = useState<Selection | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSelection = useCallback(
    (msg: SelectionMessage) => {
      const { range, userId: highlightUserId } = msg;
      const isOurOwnHighlight = userId === highlightUserId;
      if (isOurOwnHighlight) return;

      const ranges = rangee.deserializeAtomic(range);
      setHighlights((highlights) => ({
        ...highlights,
        [highlightUserId]: ranges,
      }));
    },
    [userId]
  );

  const handleClearSelection = useCallback(
    (msg: ClearSelectionMessage) => {
      // TODO: Extract this out later
      const { userId: highlightUserId } = msg;
      const isOurOwnHighlight = userId === highlightUserId;
      if (isOurOwnHighlight) return;

      setHighlights((highlights) =>
        _.pickBy(highlights, (_, userId) => userId !== highlightUserId)
      );
    },
    [userId]
  );

  useEffect(
    runAsync(async () => {
      const noMessageOrUserIdNotLoaded = !lastMessage || !userId;
      if (noMessageOrUserIdNotLoaded) return;

      const bytes = new Uint8Array(await lastMessage!!.data.arrayBuffer());
      const msg = Message.parse(unpack(bytes));

      switch (msg.kind) {
        case Codes.Selection:
          handleSelection(msg);
          break;
        case Codes.ClearSelection:
          handleClearSelection(msg);
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

  return (
    <div>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        {/* <style id="toastify" type="text/css"> {toastStyles}</style> */}
        {selection ? (
          <HighlightButton
            disabled={!userId}
            x={selection.x + HIGHLIGHT_BUTTON_OFFSET}
            y={selection.y}
          >
            Highlight
          </HighlightButton>
        ) : null}
        <ActiveHighlighter highlights={highlights} />
        <ToastContainer pauseOnFocusLoss={false} pauseOnHover={false} />
      </ReactShadowRoot>
    </div>
  );
};

export default App;

/*
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:9001/",
    {
      // There might be some goofy stuff going on here
      // with double retries (not sure why ...)
      retryOnError: true,
      //onOpen(event) {
      //  toast.dismiss(connectingToastId);
      //  toast.update(connectingToastId, {
      //    type: "success",
      //    autoClose: 1000,
      //    render: "success",
      //  });
      //},
      //shouldReconnect(closeEvent) {
      //  toast("Connecting", {
      //    autoClose: 5_000,
      //    toastId: connectingToastId,
      //  });
      //  return true;
      //},
      //reconnectAttempts: 2,
      //reconnectInterval: 5_000,
      //onReconnectStop(attempts) {
      //  toast.dismiss(connectingToastId);
      //  toast.error("Connection failed", {
      //    autoClose: false,
      //    toastId: reconnectToastId,
      //  });
      //},
    }
  );
  */
