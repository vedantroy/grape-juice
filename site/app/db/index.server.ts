import LMDBImpl from "./lmdb.server";
import { DB } from "./types.server";
import { IS_PRODUCTION } from "~/services/env";

// Choose which DB implementation to use
let DBImpl = LMDBImpl;

let db: DB;

declare global {
  var __db: DB | undefined;
}

if (IS_PRODUCTION) {
  db = new DBImpl({ path: "/tmp/dev.db" });
} else {
  if (!global.__db) {
    global.__db = new DBImpl({ path: "/tmp/dev.db" });
  }
  db = global.__db;
}

export default db;
