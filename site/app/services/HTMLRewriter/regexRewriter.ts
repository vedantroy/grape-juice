import { Rewriter } from ".";
import { oneLine } from "common-tags";
import { getPostChannel } from "~/websocket/utils";

export const regexRewriter: Rewriter = {
  makeLinksAbsolute(html, { origin }) {
    return "";
  },
  injectOverlay(html, { scriptSrc, cursorChatUrl, websocketRootUrl, postId }) {
    const headTag = html.indexOf("</head>");
    let beforeHead = html.slice(0, headTag);
    const afterHead = html.slice(headTag);
    beforeHead += oneLine`
    	<script>
    	  window.__INJECTED_POST_ID = "${postId}";
    	  window.__INJECTED_WEBSOCKET_CHANNEL_URL = "${websocketRootUrl}${getPostChannel(
      postId
    )}";
    	  window.__INJECTED_CURSOR_CHAT_URL = "${cursorChatUrl}";
    	</script>
    `;
    beforeHead += `<script type="module" src="${scriptSrc}"></script>`;
    return beforeHead + afterHead;
  },
};
