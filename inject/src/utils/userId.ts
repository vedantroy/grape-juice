import short from "short-uuid";
import { ImmortalStorage, LocalStorageStore, ImmortalDB } from "immortal-db";
import type { UserId } from "@site/db/types.server";
import colors from "src/generated/colors";
import animalNames from "src/generated/animalNames";

const USER_ID_KEY = "userId";
export async function getUserIdOtherwiseCreateNew(): Promise<string> {
  const db = import.meta.env.DEV
    ? new ImmortalStorage([LocalStorageStore])
    : ImmortalDB;
  const userId = await ImmortalDB.get(USER_ID_KEY);
  if (userId === null) {
    const uuid = short.uuid();
    await db.set(USER_ID_KEY, uuid);
    return uuid;
  }
  return userId;
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const cyrb53 = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export function getColorFromUserId(userId: UserId) {
  const hash = cyrb53(userId);
  return colors[hash % colors.length];
}

export function getAnimalNameFromUserId(userId: UserId) {
  const hash = cyrb53(userId);
  return animalNames[hash % animalNames.length];
}
