import React from "react"
import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"
import {render} from "ink-testing-library"
import {useInput, useApp} from "ink"

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

test("keymap", async t => {
  const initialLines = [
    "M filename",
    "?? filename2",
  ]

  const ARROW_UP = "\u001B[A"
  const ARROW_DOWN = "\u001B[B"

  const res1 = [
    " ❯ M filename",
    "   ?? filename2",
  ]
  const res2 = [
    "   M filename",
    " ❯ ?? filename2",
  ]
  const res3 = [
    "   M filename",
    " ❯ A filename2",
  ]

  const output = render(<Status initialLines={initialLines} />)

  await new Promise(r => setTimeout(r, 0))
  output.stdin.write("j")
  output.stdin.write(ARROW_DOWN)
  output.stdin.write("j")
  output.stdin.write("k")
  output.stdin.write(ARROW_UP)

  t.deepEqual(output.frames, [
    res1.join("\n"),
    res2.join("\n"),
    res1.join("\n"),
    res2.join("\n"),
    res1.join("\n"),
    res2.join("\n"),
  ])
})
