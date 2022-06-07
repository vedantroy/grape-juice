import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  MdContentCopy,
  MdOutlineHelpOutline,
  MdErrorOutline,
} from "react-icons/md";
import { FaSadTear } from "react-icons/fa";
import clsx from "clsx";
import copy from "copy-to-clipboard";
import { HOST_URL } from "~/services/env";
import { ToastContainer, toast } from "react-toastify";
import styles from "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "use-debounce";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash-es";

import { getURL, prefixWithHttps } from "~/helpers/url";
import { createAnonPostCode } from "~/generated/highlighted_code";
import tw from "~/components/tw-styled";
import { Col, Row } from "~/components/layout";
import { PreviewResponse } from "./api/preview";
import Spinner from "~/components/spinner";
import DB from "~/db/index.server";
import rewriter from "~/services/HTMLRewriter";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

type API = {
  higlightedCode: string;
  code: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // TODO: Move this into the client, we inject the host name into the page
  const { HTML, code } = createAnonPostCode({
    prewrap: true,
    hostUrl: HOST_URL,
  });
  return json({ code, higlightedCode: HTML } as API);
};

const POST_HTML = "html";
const POST_URL = "url";

export const action: ActionFunction = async ({ request }) => {
  const { [POST_HTML]: html, [POST_URL]: url } = Object.fromEntries(
    await request.formData()
  );
  const postId = await DB.Page.makePage({
    html: html as string,
    url: url as string,
    title: rewriter.getTitle(html as string) || "No Title",
  });

  return redirect(`/p/${postId}`);
};

const Card = tw.div(
  "bg-gray-700 mx-auto px-6 py-6 w-[85%] rounded flex flex-col items-stretch"
);
const CodeRow = tw.div(
  "text-gray-300 font-semibold text-lg flex flex-row items-center justify-center flex-wrap max-w-full gap-x-2"
);

const DividerLine = () => (
  <div className="flex-1 bg-gray-400" style={{ height: "1px" }}></div>
);

const HorizontalDivider = ({ text }: { text: string }) => (
  <Row className="w-full items-center gap-2 mt-6 mb-4">
    <DividerLine />
    <span className="text-white">{text}</span>
    <DividerLine />
  </Row>
);

const Center = tw.div(
  "w-full h-full flex flex-row items-center justify-center"
);

const MATERIAL_PALENIGHT_BACKGROUND = "#292D3E";
const TW_EMERALD_500 = "#10b981";
const TW_EMERALD_400 = "#34d399";
const TW_BLUE_500 = "#3b82f6";
const TW_BLUE_400 = "#60a5fa";
const TW_BLUE_300 = "#93c5fd";

const DevToolsRow = ({ code, url }: { code: string; url: URL | null }) => (
  <CodeRow>
    <div>Run</div>
    <button
      // TODO: I want this button to be base-aligned
      // with the other text
      onClick={() => {
        if (copy(code)) {
          toast.success("Copied to clipboard");
        } else {
          toast.error("Failed to copy to clipboard");
        }
      }}
      className="flex flex-row items-center rounded bg-gray-800 h-8 px-2"
    >
      code
      <MdContentCopy size={16} color="white" className="ml-2" />
    </button>
    <div>In</div>
    <div>
      <a href={url?.toString() || "https://example.com"}>
        <span className="hover:underline text-gray-300 font-normal">
          {url
            ? _.truncate(
                url.host + (url.pathname === "/" ? "" : url.pathname),
                { length: 18, omission: "..." }
              )
            : "example.com"}
        </span>
      </a>
      's
    </div>
    Dev Tools
    <Link to="/help/upload">
      <MdOutlineHelpOutline size={22} color={TW_BLUE_500} />
    </Link>
  </CodeRow>
);

export default function () {
  const { code } = useLoaderData<API>();

  const transition = useTransition();
  const submitting = transition.state === "submitting";

  const [urlText, setUrlText] = useState("");
  const url = useMemo(() => getURL(prefixWithHttps(urlText)), [urlText]);
  const [debouncedUrl] = useDebounce(url, 250);

  const fetcher = useFetcher<PreviewResponse>();

  useEffect(() => {
    if (url === null || !fetcher) return;
    fetcher.load(`/api/preview?url=${encodeURIComponent(url.toString())}`);
  }, [debouncedUrl]);

  // TODO: More elegant way to do this?
  // (this kind of repetitive & the UI might be out of sync ??)
  const submitHTML =
    urlText !== "" &&
    fetcher.state === "idle" &&
    fetcher.data &&
    "html" in fetcher.data
      ? fetcher.data.html
      : null;

  const disableSubmit = submitting || !submitHTML;

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
            borderTop: clsx("2px solid", TW_EMERALD_500),
          }}
        >
          <input
            type="text"
            placeholder="Paste URL"
            className={clsx(
              "w-full rounded-sm bg-gray-800 text-white text-center placeholder:text-white"
              //"placeholder:text-left text-left"
            )}
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
          ></input>
          <HorizontalDivider text="or" />
          <DevToolsRow url={url} code={code} />
          <div className="mt-4 text-white font-semibold text-xl">Preview</div>
          <div
            className="mt-2 w-full rounded-lg h-80 max-h-[50vh]"
            style={{ background: MATERIAL_PALENIGHT_BACKGROUND }}
          >
            {urlText === "" ? (
              <Center className="text-lg text-gray-400 font-semibold">
                No URL Provided
              </Center>
            ) : fetcher.state === "loading" ? (
              <Center>
                <Spinner svgClassName="text-gray-800 fill-gray-600 w-12 h-12" />
              </Center>
            ) : fetcher.data ? (
              "error" in fetcher.data ? (
                <Center className="text-lg font-semibold text-rose-700 p-8">
                  <Col className="w-full items-center">
                    <MdErrorOutline size={36} className="mr-2" />
                    {fetcher.data.error.split("\n").map((line) => (
                      <div className="text-center">{line}</div>
                    ))}
                  </Col>
                </Center>
              ) : (
                <Center>
                  <iframe
                    srcDoc={fetcher.data.html}
                    className="w-full h-full"
                  ></iframe>
                </Center>
              )
            ) : // TODO: Not sure what this case is
            null}
          </div>
          <Form method="post">
            <input type="hidden" name={POST_HTML} value={submitHTML!!}></input>
            <input type="hidden" name={POST_URL} value={urlText}></input>
            <button
              disabled={disableSubmit}
              type="submit"
              className={clsx(
                "bg-emerald-500 w-full mt-8 text-white font-semibold text-lg py-2 rounded",
                disableSubmit && "cursor-not-allowed bg-emerald-300"
              )}
            >
              Submit
            </button>
          </Form>
        </Card>
      </Col>
    </>
  );
}
