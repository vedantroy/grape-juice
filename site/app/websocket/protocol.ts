import zod, { z } from "zod";

const Codes = {
  Subscribe: 0,
  Selection: 1,
  ClearSelection: 2,
  CreateHighlight: 3,

  // Never received, only sent to client
  HighlightCreated: 4,
  Subscribed: 5,
} as const;

export { Codes };

// Active Operations
// - change highlight
// - remove highlight
// Why not use CRDT?
// - With a CRDT I'll only need to transmit one type of update
//    (e.g a generic "CRDTChange" message)
// But I'll need to observe & integrate the changed data regardless

// TODO: I should remove the DB types entirely & just
// use the types from here as the source of truth

export const Reply = zod.object({
  userId: z.string(),
  id: z.string(),
  date: z.date(),
  text: z.string(),
});
export type Reply = zod.infer<typeof Reply>;

export const Highlight = zod.object({
  id: z.string(),
  range: z.string(),
  userId: z.string(),
  replies: z.array(Reply),
  containerSelector: z.string(),
});
export type Highlight = zod.infer<typeof Highlight>;

export const SubscribedMessage = zod.object({
  kind: z.literal(Codes.Subscribed),
  highlights: z.record(z.string(), Highlight),
});
export type SubscribedMessage = zod.infer<typeof SubscribedMessage>;

const SubscribeMessage = zod.object({
  kind: z.literal(Codes.Subscribe),
  postId: z.string(),
});
export type SubscribeMessage = zod.infer<typeof SubscribeMessage>;

const SelectionMessage = zod.object({
  kind: z.literal(Codes.Selection),
  postId: z.string(),
  userId: z.string().uuid(),
  range: z.string(),
});
export type SelectionMessage = zod.infer<typeof SelectionMessage>;

const ClearSelectionMessage = zod.object({
  kind: z.literal(Codes.ClearSelection),
  postId: z.string(),
  userId: z.string().uuid(),
});
export type ClearSelectionMessage = zod.infer<typeof ClearSelectionMessage>;

export const CreateHighlightMessage = zod.object({
  kind: z.literal(Codes.CreateHighlight),
  postId: z.string(),
  userId: z.string().uuid(),
  range: z.string(),
  containerSelector: z.string(),
  initialReply: z.string(),
});
export type CreateHighlightMessage = zod.infer<typeof CreateHighlightMessage>;

export const HighlightCreatedMessage = zod.object({
  id: z.string(),
  kind: z.literal(Codes.HighlightCreated),
  postId: z.string(),
  userId: z.string().uuid(),
  range: z.string(),
  containerSelector: z.string(),
  reply: Reply,
});

export type HighlightCreatedMessage = zod.infer<typeof HighlightCreatedMessage>;

export const Message = zod.union([
  SubscribeMessage,
  SubscribedMessage,
  SelectionMessage,
  ClearSelectionMessage,
  CreateHighlightMessage,
  HighlightCreatedMessage,
]);
export type Message = zod.infer<typeof Message>;
