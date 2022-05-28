//import root from "react-shadow";

import React, { useCallback, useRef, useState } from "react";
import styles from "../index.css";
//import tw from "../utils/tw-styled";
import { extractCss } from "goober";
import ReactShadowRoot from "react-shadow-root";
import { ToastContainer, toast } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css";

const TOAST_CSS = extractCss();

// Problem: Toast CSS is not applied to the shadow dom
// Urgency: Low-ish
// Punt till later?
// Reasons not to punt: We might get roped into another design decision
// that prevents us from using Goober
// Decision: Punt
// I think I can solve this problem with:
// https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides
// install goober, patch it to only work inside a shadow DOM
// then override the react-hot-toast goober dep to my custom goober

const App = () => {
  const [ref, setRef] = useState<ReactShadowRoot | null>(null);
  if (ref) {
    console.log("reffing");
    setInterval(() => {
      console.log("mkaign toast");
      toast.error("Hello world!");
    }, 1_000);
  }

  //const setRef2 = useCallback((target: HTMLElement) => {
  //  css.bind({ target });
  //  styled.bind({ target });
  //  toast("can I display toasts !!");
  //}, []);

  //const [ref, setRef] = useState<HTMLElement | null>(null);
  //if (ref) {
  //  console.log("MAKING TOAST");
  //}

  console.log(`setting css to: ${TOAST_CSS}`);

  //@ts-ignore
  if (!ref) setRef(true);

  return (
    //<div>
    //  <style type="text/css">{styles}</style>
    //  <style type="text/css">{TOAST_CSS}</style>
    //  <Toaster position="bottom-right" />
    //  fun!fun!
    //</div>

    <div>
      <ReactShadowRoot ref={(ref) => setRef(ref)}>
        <style type="text/css">{styles}</style>
        <style type="text/css">{toastStyles}</style>
        <ToastContainer />
      </ReactShadowRoot>
    </div>
  );
};

export default App;
