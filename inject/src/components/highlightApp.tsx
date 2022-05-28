import root from "react-shadow";
import React, { useState } from "react";
import styles from "../index.css";
import tw from "../utils/tw-styled";

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
`);

const App = () => {
  const [coords, setCoords] = useState<Coords | null>(null);
  // We need to control this value outside of React
  window.setCoords = setCoords;
  return (
    <root.div>
      <style type="text/css">{styles}</style>
      {coords ? (
        <Button style={{ zIndex: 9999, top: coords.y, left: coords.x }}>
          Highlight
        </Button>
      ) : null}
    </root.div>
  );
};

export default App;
