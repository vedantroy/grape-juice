import short from "short-uuid";
import { ImmortalDB } from "immortal-db";

const USER_ID_KEY = "userId";
export async function getUserIdOtherwiseCreateNew() {
  const userId = await ImmortalDB.get(USER_ID_KEY);
  if (userId === undefined) {
    const uuid = short.generate();
    await ImmortalDB.set(USER_ID_KEY, uuid);
    return uuid;
  }
  return userId;
}
