export const prefixWithHttps = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;

export function getURL(url: string): URL | null {
  try {
    return new URL(url);
  } catch (_) {
    return null;
  }
}
