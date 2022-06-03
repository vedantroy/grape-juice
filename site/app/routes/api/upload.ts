import { z } from "zod";
import { ActionFunction } from "@remix-run/node";
import DB from "~/db/index.server";
import { HOST_URL } from "~/services/env";
import { ALLOW_CORS_HEADERS, CORSPreflightLoader } from "~/helpers/cors";

const Schema = z.object({
  html: z.string(),
  title: z.string(),
  url: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
  const { html, url, title } = Schema.parse(await request.json());

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

export const loader = CORSPreflightLoader;
