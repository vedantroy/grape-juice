import { UserId } from "@site/db/types.server";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactShadowRoot from "react-shadow-root";
import { getColorFromUserId } from "src/utils/userId";
import invariant from "tiny-invariant";
import CursorChat, { ID_CURSOR_CHAT_BOX, ID_CURSOR_CHAT_LAYER } from "./lib";
import styles from "./styles.css?inline";

export default function ({
  userId,
  websocketUrl,
}: {
  userId: UserId;
  websocketUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!input) return;

    const { current } = ref;
    invariant(current, `shadow root wrapper is not initialized`);

    const shadowRoot = current.shadowRoot;
    invariant(shadowRoot, `shadowRoot is not initialized`);

    const root: ShadowRoot = current.shadowRoot!!;
    new CursorChat(websocketUrl, getColorFromUserId(userId), root);
  }, [input]);

  return (
    <div style={{ all: "initial" }} ref={ref}>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        {/* This might be unsafe b/c react can dynamically construct & destroy
	    these divs / randomly destroy the cursor chat related divs */}
        <div id={ID_CURSOR_CHAT_LAYER}>
          <input
            ref={(ref) => setInput(ref)}
            type="text"
            id={ID_CURSOR_CHAT_BOX}
          ></input>
        </div>
      </ReactShadowRoot>
    </div>
  );
}
