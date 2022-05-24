import tw from "~/components/tw-styled";
import { Col, Row } from "~/components/layout";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MdContentCopy } from "react-icons/md";
import { createAnonPostCode } from "~/generated/highlighted_code";
import clsx from "clsx";
import { HOST_URL } from "~/services/env";

type API = {
  code: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const wrapped = createAnonPostCode({ prewrap: true, hostUrl: HOST_URL });
  return json({ code: wrapped } as API);
};

export const action: ActionFunction = async ({ request }) => {
  const json = await request.json();
  const { type } = json;
};

const Card = tw.div(
  "bg-gray-700 mx-auto px-6 py-6 w-[700px] max-w-[66%] rounded"
);
const Header = tw.div("text-white font-semibold text-xl");
const CodeBox = tw.div("w-full p-2 cursor-pointer rounded-lg");

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

export default function () {
  const data = useLoaderData<API>();

  return (
    <Col className="h-screen w-screen bg-gray-900 justify-center">
      <Card
        style={{
          //aspectRatio: "2 / 3",
          // Can't set top border using tailwind
          borderTop: clsx("2px solid", TW_EMERALD_400),
          //background: "linear-gradient(180deg, #1F2937 0%, #4B5563 100%);",
          //background: "linear-gradient(180deg, #1F2937 0%, #374151 100%);",
        }}
      >
        <Header className="mb-2">Paste Into DevTools</Header>
        <CodeBox style={{ background: MATERIAL_PALENIGHT_BACKGROUND }}>
          <div className="relative break-all max-w-full pr-8">
            <div dangerouslySetInnerHTML={{ __html: data.code }}></div>
            <MdContentCopy color="white" className="absolute top-0 right-0" />
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
  );
}
