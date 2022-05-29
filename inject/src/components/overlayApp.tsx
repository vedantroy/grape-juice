// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React, { useEffect, useState } from "react";
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
} from "@site/websocket/protocol";

// https://github.com/vitejs/vite/issues/3246
import styles from "../index.css?inline";
import { Rangee } from "rangee";
import ActiveHighlighter, { HighlighterProps } from "./highlighter";
import { getSelectionUpdate, Selection } from "src/utils/selection";
import { getUserIdOtherwiseCreateNew } from "src/utils/userId";

const rangee = new Rangee({ document });

const reconnectToastId = "reconnect-toast";
const connectingToastId = "connect-toast";

const HighlightButton = tw.button(`
    absolute
    bg-blue-400
    hover:bg-blue-500
    text-white
    rounded
    font-semibold
    px-2
    py-1.5
    select-none
`);

const CHANNEL = "foobar";

const App = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:9001/${CHANNEL}`,
    {}
  );

  const [highlights, setHighlights] = useState<HighlighterProps["highlights"]>(
    {}
  );

  useEffect(() => {
    if (!lastMessage) return;
    async function go() {
      const buf = await lastMessage!!.data.arrayBuffer();
      const uint8 = new Uint8Array(buf);
      const msg = Message.parse(unpack(uint8));
      if (msg.kind === Codes.Selection) {
        const { range, userId: highlightUserId } = msg;
        // it's us, no need to do anything
        if (highlightUserId === userId) return;
        const ranges = rangee.deserializeAtomic(range);
        setHighlights({ ...highlights, [highlightUserId]: ranges });
      }
    }
    go();
  }, [lastMessage?.data]);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const onSelection = () => setSelection(getSelectionUpdate(rangee));
    document.addEventListener("onselectionchange", onSelection);
    const go = async () => setUserId(await getUserIdOtherwiseCreateNew());
    go();

    return () => {
      document.removeEventListener("onselectionchange", onSelection);
    };
  }, []);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      const msg: SubscribeMessage = {
        kind: Codes.Subscribe,
        postId: CHANNEL,
      };
      sendMessage(pack(msg), true);
    }
  }, [readyState === ReadyState.OPEN]);

  useEffect(() => {
    if (selection?.serializedRange && userId) {
      const { serializedRange } = selection;
      const msg: SelectionMessage = {
        kind: Codes.Selection,
        postId: CHANNEL,
        range: serializedRange,
        userId,
      };
      sendMessage(pack(msg), false);
    } else if (userId) {
    }
  }, [selection?.serializedRange, userId]);

  return (
    <div>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        {/* <style id="toastify" type="text/css"> {toastStyles}</style> */}
        {selection ? (
          <HighlightButton
            // This will almost never trigger, but it's here for completeness
            // (If the user highlights text before the fingerprint loads)
            className={clsx(
              !userId && "bg-blue-300 hover:bg-blue-300 cursor-wait"
            )}
            style={{ zIndex: 9999, top: selection.y, left: selection.x }}
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
