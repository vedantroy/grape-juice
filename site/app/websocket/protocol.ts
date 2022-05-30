import zod, { z } from "zod";

const Codes = {
  Subscribe: 0,
  Selection: 1,
  ClearSelection: 2,
  CreateHighlight: 3,

  // Never received, only sent to client
  Subscribed: 4,
} as const;

export { Codes };

// Active Operations
// - change highlight
// - remove highlight
// Why not use CRDT?
// - With a CRDT I'll only need to transmit one type of update
//    (e.g a generic "CRDTChange" message)
// But I'll need to observe & integrate the changed data regardless

const SubscribedMessage = zod.object({
  kind: z.literal(Codes.Subscribed),
});

const SubscribeMessage = zod.object({
  kind: z.literal(Codes.Subscribe),
  postId: z.string(),
});
export type SubscribeMessage = zod.infer<typeof SubscribeMessage>;

const SelectionMessage = zod.object({
  kind: z.literal(Codes.Selection),
  postId: z.string(),
  userId: z.string(),
  range: z.string(),
});
export type SelectionMessage = zod.infer<typeof SelectionMessage>;

const ClearSelectionMessage = zod.object({
  kind: z.literal(Codes.ClearSelection),
  postId: z.string(),
  userId: z.string(),
});
export type ClearSelectionMessage = zod.infer<typeof ClearSelectionMessage>;

export const CreateHighlightMessage = zod.object({
  kind: z.literal(Codes.CreateHighlight),
  postId: z.string(),
  userId: z.string(),
  range: z.string(),
});
export type CreateHighlightMessage = zod.infer<typeof CreateHighlightMessage>;

export const Message = zod.union([
  SubscribeMessage,
  SubscribedMessage,
  SelectionMessage,
  ClearSelectionMessage,
  CreateHighlightMessage,
]);
export type Message = zod.infer<typeof Message>;
