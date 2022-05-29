import React, { useEffect, useRef, useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";

import toastStyles from "react-toastify/dist/ReactToastify.css";
import styles from "../index.css";

type Selection = {
  serialized: string;
};

export const OVERLAY_LOADED = "overlay-loaded";

const reconnectToastId = "reconnect-toast";
const connectingToastId = "connect-toast";

const App = () => {
  return (
    <div>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        <style type="text/css">{toastStyles}</style>
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
