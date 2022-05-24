import { z } from "zod";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import DB from "~/db/index.server";
import { HOST_URL } from "~/services/env";

const Schema = z.object({
  html: z.string(),
  title: z.string(),
  url: z.string(),
});

// Taken from: https://github.com/stevejpurves/remix/pull/1
const ALLOW_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, Content-Type",
} as const;

export const action: ActionFunction = async ({ request }) => {
  const { html, url, title } = Schema.parse(await request.json());

  console.log("DATA IS BEING INSERTED");

  // No validation for now -- maybe we'll want it in the future?
  const postId = await DB.Page.makePage({ html, url, title });
  const response = {
    url: `${HOST_URL}/p/${postId}`,
    status: "success",
  };

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
      ...ALLOW_CORS_HEADERS,
    },
  });
};

export const loader: LoaderFunction = async () => {
  // Devtools will make a CORs Preflight request to this endpoint
  const CORSPreflightResponse = new Response(null, {
    status: 200,
    headers: ALLOW_CORS_HEADERS,
  });
  return CORSPreflightResponse;
};
