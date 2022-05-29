import React, { useEffect, useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { pack } from "msgpackr";

import tw from "@site/components/tw-styled";
import { Codes } from "@site/websocket/protocol";

import toastStyles from "react-toastify/dist/ReactToastify.css";
import styles from "../index.css";
import clsx from "clsx";

export const OVERLAY_LOADED = "overlay-loaded";

const reconnectToastId = "reconnect-toast";
const connectingToastId = "connect-toast";

export type Selection = { x: number; y: number; serializedRange: string };
type setSelection = (coords: Selection | null) => void;

declare global {
  interface Window {
    setSelection: undefined | setSelection;
    setUserId: undefined | ((userId: string) => void);
  }
}

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

const App = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:9001/",
    {}
  );

  const [selection, setSelection] = useState<Selection | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    window.setSelection = setSelection;
    window.setUserId = setUserId;
    window.dispatchEvent(new Event(OVERLAY_LOADED));
  }, []);

  useEffect(() => {
    sendMessage(pack({}), false);
  }, [selection?.serializedRange]);

  return (
    <div>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        <style type="text/css">{toastStyles}</style>
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
