import { PostId } from "~/db/types.server";
import { regexRewriter } from "./regexRewriter";

export interface Rewriter {
  getTitle(html: string): string | null;
  makeLinksAbsolute(html: string, data: { originUrl: string }): string;
  injectOverlay(
    html: string,
    data: {
      cssSrc: string;
      scriptSrc: string;
      cursorChatUrl: string;
      websocketRootUrl: string;
      hostUrl: string;
      postId: PostId;
    }
  ): string;
}

const rewriterImpl: Rewriter = regexRewriter;
export default rewriterImpl;
