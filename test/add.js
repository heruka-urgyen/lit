import React from "react"
import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"
import {render} from "ink-testing-library"

import {preRender} from "../src/add"
import Status from "../src/components/Status"

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

test("render view", t => {
  const initialLines = [
    "M filename",
    "A filename2",
    "?? filename3",
  ]
  const output = render(<Status initialLines={initialLines} />)

  const res = [
    " ❯ M filename",
    "   A filename2",
    "   ?? filename3",
  ].join("\n")

  t.deepEqual(output.lastFrame(), res)
})
