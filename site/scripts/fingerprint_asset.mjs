#! /usr/bin/env node

import fs from "fs"
import { sha1File  } from "sha1-file"

const args = process.argv;
if (args.length !== 3) {
    throw Error(`Usage: [script] file-name`)
}

const filePath = args[2]

async function go() {
    const hash = await sha1File(filePath)
    const lastDot = filePath.lastIndexOf(".")
    const beforeExt = filePath.slice(0, lastDot)
    const extWithDot = filePath.slice(lastDot)
    // esbuild uses fingerprints that are 8 chars long
    fs.copyFileSync(filePath, beforeExt + "." + hash.slice(0, 8) + extWithDot)
}

go()


