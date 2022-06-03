import { LoaderFunction } from "@remix-run/node";

// Taken from: https://github.com/stevejpurves/remix/pull/1
export const ALLOW_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, Content-Type",
} as const;

export const CORSPreflightLoader: LoaderFunction = async () => {
  // Devtools will make a CORs Preflight request to this endpoint
  const CORSPreflightResponse = new Response(null, {
    status: 200,
    headers: ALLOW_CORS_HEADERS,
  });
  return CORSPreflightResponse;
};
