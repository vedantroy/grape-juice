import LMDBImpl from "./lmdb.server";
import { DB } from "./types.server";
import { IS_PRODUCTION, LMDB_PATH } from "..//services/env";

// Choose which DB implementation to use
let DBImpl = LMDBImpl;

let db: DB;

declare global {
  var __db: DB | undefined;
}

if (IS_PRODUCTION) {
  console.log(`Running db at path: ${LMDB_PATH}`);
  db = new DBImpl({ path: LMDB_PATH });
} else {
  if (!global.__db) {
    global.__db = new DBImpl({ path: LMDB_PATH });
  }
  db = global.__db;
}

export default db;
