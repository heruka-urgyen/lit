import {testProp, fc} from "ava-fast-check"

import {parseCommitHash} from "commands/log/utils"

testProp(
  "should parse commit hash",
  [fc.hexaString(7, 7), fc.unicodeString(1), fc.integer(1), fc.base64String(1)],
  async (t, hash, msg, timestamp, author) => {
    const commit = `${hash} - ${msg} (${timestamp} time ago) <${author}>`

    const res = parseCommitHash(commit)

    t.deepEqual(res, hash)
  },
)
