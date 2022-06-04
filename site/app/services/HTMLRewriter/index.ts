import { PostId } from "~/db/types.server";
import { regexRewriter } from "./regexRewriter";

export interface Rewriter {
  makeLinksAbsolute(html: string, data: { origin: string }): string;
  injectOverlay(
    html: string,
    data: {
      scriptSrc: string;
      cssSrc: string;
      cursorChatUrl: string;
      websocketRootUrl: string;
      postId: PostId;
    }
  ): string;
}

const rewriterImpl: Rewriter = regexRewriter;
export default rewriterImpl;
