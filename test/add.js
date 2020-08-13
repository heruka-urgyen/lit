import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"

import {preRender} from "../src/add"

test("pre-render view", t => {
  const output = stdout.inspectSync(function() {
    preRender(["M filename"])
  })

  const res = [
    "",
    " s - stage | r - reset | c - commit staged | f - fixup | q - quit",
    "",
    " ❯ M filename",
    "",
    "",
  ].join("\n")

  t.deepEqual(output.map(stripAnsi), [res])
})
