import tw from "~/components/tw-styled";
import { Col, Row } from "~/components/layout";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { MdContentCopy, MdOutlineHelpOutline } from "react-icons/md";
import { createAnonPostCode } from "~/generated/highlighted_code";
import clsx from "clsx";
import copy from "copy-to-clipboard";
import { HOST_URL } from "~/services/env";
import { ToastContainer, toast } from "react-toastify";
import styles from "react-toastify/dist/ReactToastify.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

type API = {
  higlightedCode: string;
  code: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { HTML, code } = createAnonPostCode({
    prewrap: true,
    hostUrl: HOST_URL,
  });
  return json({ code, higlightedCode: HTML } as API);
};

export const action: ActionFunction = async ({ request }) => {
  const json = await request.json();
  const { type } = json;
};

const Card = tw.div(
  "bg-gray-700 mx-auto px-6 py-6 w-[700px] max-w-[66%] rounded"
);
const Header = tw.div(
  "text-white font-semibold text-xl flex flex-row items-center gap-x-2"
);
const CodeBox = tw.div("w-full p-2 rounded-lg");

const DividerLine = () => (
  <div className="flex-1 bg-gray-400" style={{ height: "1px" }}></div>
);

const HorizontalDivider = ({ text }: { text: string }) => (
  <Row className="w-full items-center gap-2 my-4">
    <DividerLine />
    <span className="text-white">{text}</span>
    <DividerLine />
  </Row>
);

const MATERIAL_PALENIGHT_BACKGROUND = "#292D3E";
const TW_EMERALD_500 = "#10b981";
const TW_EMERALD_400 = "#34d399";
const TW_BLUE_500 = "#3b82f6";
const TW_BLUE_400 = "#60a5fa";
const TW_BLUE_300 = "#93c5fd";

export default function () {
  const { code, higlightedCode } = useLoaderData<API>();

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
      />
      <Col className="h-screen w-screen bg-gray-900 justify-center">
        <Card
          style={{
            // Can't set top border using tailwind
            borderTop: clsx("2px solid", TW_EMERALD_400),
          }}
        >
          <Header className="mb-2">
            Paste Into DevTools
            <Link to="/help/upload">
              <MdOutlineHelpOutline size={22} color={TW_BLUE_400} />
            </Link>
          </Header>
          <CodeBox style={{ background: MATERIAL_PALENIGHT_BACKGROUND }}>
            <div className="relative break-all max-w-full pr-8">
              <div dangerouslySetInnerHTML={{ __html: higlightedCode }}></div>
              <MdContentCopy
                size={22}
                color="white"
                className="absolute top-0 right-0 cursor-pointer"
                onClick={() => {
                  if (copy(code)) {
                    toast.success("Copied to clipboard");
                  } else {
                    toast.error("Failed to copy to clipboard");
                  }
                }}
              />
            </div>
          </CodeBox>
          <HorizontalDivider text="or" />
          <input
            type="text"
            placeholder="Paste URL"
            className="mx-auto my-0 rounded-sm bg-gray-800 text-white text-center block placeholder:text-white"
          ></input>
        </Card>
      </Col>
    </>
  );
}
