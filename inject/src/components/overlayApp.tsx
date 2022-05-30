// TODOS:
// - Ranges are stored super inefficiently
// - No support for incremental updates, we always send the entire range

import React, { useEffect, useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { pack, unpack } from "msgpackr";
import clsx from "clsx";
import { pluckFirst, useObservable, useSubscription } from "observable-hooks";

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
import HighlightButton from "./highlightButton";
import { filter, map, mergeMap, share, withLatestFrom } from "rxjs";

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

  const message$ = useObservable<Message, Array<MessageEvent | null>>(
    (event$) =>
      event$.pipe(
        pluckFirst,
        filter<MessageEvent | null, MessageEvent>(
          (x: MessageEvent | null): x is MessageEvent => x !== null
        ),
        // like map but it works with promises
        mergeMap(async (x) => {
          const bytes = new Uint8Array(await x.data.arrayBuffer());
          return Message.parse(unpack(bytes));
        }),
        share()
      ),
    [lastMessage]
  );

  useSubscription(
    message$.pipe(
      filter<Message, SelectionMessage>(
        (x): x is SelectionMessage => x.kind === Codes.Selection
      ),
      filter((x) => x.userId !== userId),
      map(({ userId, range }) => ({
        ...highlights,
        [userId]: rangee.deserializeAtomic(range),
      }))
    ),
    (highlights) => setHighlights(highlights)
  );

  // useEffect(() => {
  //   if (!lastMessage) return;
  //   async function go() {
  //     const buf = await lastMessage!!.data.arrayBuffer();
  //     const uint8 = new Uint8Array(buf);
  //     const msg = Message.parse(unpack(uint8));
  //     if (msg.kind === Codes.Selection) {
  //       const { range, userId: highlightUserId } = msg;
  //       // it's us, no need to do anything
  //       if (highlightUserId === userId) return;
  //       const ranges = rangee.deserializeAtomic(range);
  //       setHighlights({ ...highlights, [highlightUserId]: ranges });
  //     }
  //   }
  //   go();
  // }, [lastMessage?.data]);

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
          <HighlightButton disabled={!userId} x={selection.x} y={selection.y}>
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
