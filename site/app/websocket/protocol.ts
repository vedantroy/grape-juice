import zod, { z } from "zod";

const Codes = {
  Subscribe: 0,
  ActiveHighlight: 1,
  CursorPosition: 2,
  // Never received, only sent to client
  Subscribed: 2,
} as const;

export { Codes };

const SubscribedMessage = zod.object({
  kind: z.literal(Codes.Subscribed),
});

const SubscribeMessage = zod.object({
  kind: z.literal(Codes.Subscribe),
  postId: z.string(),
});
export type SubscribeMessage = zod.infer<typeof SubscribeMessage>;

export type ActiveHighlightBin = {
  range: string;
  userId: string;
};

const ActiveHighlightMessage = zod.object({
  kind: z.literal(Codes.ActiveHighlight),
  postId: z.string(),
  // TODO: In the future, this can be nested message pack
  // data that is serialized to binary
  bin: z.any(),
});
export type ActiveHighlightMessage = zod.infer<typeof ActiveHighlightMessage>;

const CursorPositionMessage = zod.object({
  kind: z.literal(Codes.CursorPosition),
  postId: z.string(),
  // See comment in `ActiveHighlight`
  bin: z.any(),
});
export type CursorPositionMessage = zod.infer<typeof CursorPositionMessage>;

export const Message = zod.union([
  SubscribeMessage,
  SubscribedMessage,
  ActiveHighlightMessage,
  CursorPositionMessage,
]);
export type Message = zod.infer<typeof Message>;
