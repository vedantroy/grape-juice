import { Rewriter } from "..";
import { oneLine } from "common-tags";
import { getPostChannel } from "~/websocket/utils";
import { convertAllRelativeToAbsoluteUrls } from "./url";

function injectIntoHead(html: string, toInject: string[]): string {
  const headTag = html.indexOf("</head>");
  let beforeHead = html.slice(0, headTag);
  const afterHead = html.slice(headTag);
  for (const snippet of toInject) {
    beforeHead += snippet;
  }
  return beforeHead + afterHead;
}

function trimQuotes(str: string): string {
  if (str[0] === '"' && str[str.length - 1] === '"') {
    return str.slice(1, -1);
  }
  return str;
}

export const regexRewriter: Rewriter = {
  getTitle(html: string): string | null {
    const matchGroup = /<title.*?>(.*)<\/title>/.exec(html);
    return matchGroup ? matchGroup[1] : null;
  },
  // TODO: This breaks on srcset attributes in `img` tags
  // (e.g on lobste.rs, the user icons don't show up)
  // TODO: Need to figure out how to bypass X-Frame-Options
  makeLinksAbsolute(html, { originUrl }) {
    const url = new URL(originUrl);
    const { origin, pathname } = url;
    const baseUrl = origin + pathname;
    const newHtml = convertAllRelativeToAbsoluteUrls(html, baseUrl);
    return newHtml;
  },
  injectOverlay(
    html,
    { scriptSrc, cursorChatUrl, websocketRootUrl, postId, hostUrl }
  ) {
    return injectIntoHead(html, [
      oneLine`
    	<script>
    	  window.__INJECTED_POST_ID = "${postId}";
    	  window.__INJECTED_WEBSOCKET_CHANNEL_URL = "${trimQuotes(
          websocketRootUrl
        )}${getPostChannel(postId)}";
    	  window.__INJECTED_CURSOR_CHAT_URL = "${trimQuotes(cursorChatUrl)}";
        window.__INJECTED_HOST_URL = "${trimQuotes(hostUrl)}";
    	</script>
    `,
      `<script type="module" src="${scriptSrc}"></script>`,
      // We want links to open a new tab, the UX is less confusing
      `<base target="_blank"/>`,
    ]);
  },
};
