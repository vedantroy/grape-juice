import root from "react-shadow";
import toast, { Toaster } from "react-hot-toast";
import React, { useCallback, useRef, useState } from "react";
import styles from "../index.css";
import tw from "../utils/tw-styled";
import { css, styled } from "goober";

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
  const setRef2 = useCallback((target: HTMLElement) => {
    css.bind({ target });
    styled.bind({ target });
    toast("can I display toasts !!");
  }, []);

  //const [ref, setRef] = useState<HTMLElement | null>(null);
  //if (ref) {
  //  console.log("MAKING TOAST");
  //}

  return (
    <root.div ref={setRef2}>
      <Toaster />
      <style type="text/css">{styles}</style>
      fun!fun!
    </root.div>
  );
};

export default App;
