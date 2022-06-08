import { Brand } from "ts-brand";

export type PostId = Brand<string, "PostId">;

// key = PostId
export type Page = {
  html: string;
  url: string;
  title: string;
  date: Date;
  highlights: Record<HighlightId, Highlight>;
};

export type UserId = Brand<string, "UserId">;

export type HighlightId = Brand<string, "HighlightId">;
export type Highlight = {
  id: HighlightId;
  userId: UserId;
  range: string;
  containerSelector: string;
  replies: Reply[];
};

export type ReplyId = Brand<string, "ReplyId">;
export type Reply = {
  userId: UserId;
  id: ReplyId;
  date: Date;
  text: string;
};

type MaybePromise<T> = T | Promise<T>;

export interface DB {
  Page: {
    slugToPageId(slug: string): PostId;
    getPages(): MaybePromise<
      Array<{ url: string; title: string; date: Date; key: string }>
    >;
    makePage(args: Pick<Page, "html" | "url" | "title">): MaybePromise<PostId>;
    // Used by Remix for initial page load (embed highlights in)
    getPageWithHighlightsAndReplies(id: PostId): MaybePromise<Page | null>;
    getPageHighlightsAndReplies(
      id: PostId
    ): MaybePromise<Record<HighlightId, Highlight>>;
    makeHighlight(
      id: PostId,
      highlight: {
        userId: UserId;
        range: string;
        containerSelector: string;
        initialReply: string;
      }
    ): MaybePromise<Highlight>;
    makeHighlightReply(
      id: PostId,
      reply: {
        userId: UserId;
        highlightId: HighlightId;
        text: string;
      }
      // returns null if there was no highlight with the given id
    ): MaybePromise<Reply[] | null>;
  };
}
