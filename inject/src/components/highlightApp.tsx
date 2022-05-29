import ReactShadowRoot from "react-shadow-root";
import React, { useState } from "react";
import styles from "../index.css";
import tw from "../utils/tw-styled";
import { USER_ID_SYMBOL } from "../utils/globals";
import clsx from "clsx";

type Coords = { x: number; y: number };
type SetCoords = (coords: Coords | null) => void;

export const setCoordsIfLoaded: SetCoords = (coords) => {
  window.setCoords && window.setCoords(coords);
};

declare global {
  interface Window {
    setCoords: undefined | SetCoords;
  }
}

const Button = tw.button(`
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
  const [coords, setCoords] = useState<Coords | null>(null);
  // We need to control this value outside of React
  window.setCoords = setCoords;
  return (
    <div>
      <ReactShadowRoot>
        <style type="text/css">{styles}</style>
        {coords ? (
          <Button
            // This will almost never trigger, but it's here for completeness
            // (If the user highlights text before the fingerprint loads)
            className={clsx(
              !window[USER_ID_SYMBOL] &&
                "bg-blue-300 hover:bg-blue-300 cursor-wait"
            )}
            style={{ zIndex: 9999, top: coords.y, left: coords.x }}
          >
            Highlight
          </Button>
        ) : null}
      </ReactShadowRoot>
    </div>
  );
};

export default App;
