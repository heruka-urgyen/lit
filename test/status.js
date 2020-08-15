import React from "react"
import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"
import {render} from "ink-testing-library"
import {useInput, useApp} from "ink"
import sinon from "sinon"

import {preRender} from "../src/commands/status/index"
import Status from "../src/commands/status/View"
import * as s from "../src/commands/status/utils"
import * as g from "../src/git-utils"

const delay = (n = 100) => new Promise(r => setTimeout(r, n))

let runCommand
let gitStatus
let gitDiff
let gitLog

test.beforeEach(_ => {
  runCommand = sinon.spy(s, "runCommand")
  gitStatus = sinon.stub(g, "gitStatus")
  gitDiff = sinon.stub(g, "gitDiff")
  gitLog = sinon.stub(g, "gitLog")
})

test.afterEach(_ => {
  s.runCommand.restore()
  gitStatus.restore()
  gitDiff.restore()
  gitLog.restore()
})

test.serial("pre-render view", t => {
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

test.serial("render view", t => {
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

test.serial("actions on keys in status", async t => {
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
  const res4 = [
    "   M filename",
    " ❯ ?? filename2",
  ]
  const res5 = [
    " ❯ 123qwe - commmit msg1",
    "   124qwe - commmit msg2",
    "   125qwe - commmit msg3",
  ]

  gitStatus.onCall(0).returns({on: (_, f) => f([
    "M filename",
    "A filename2",
    "",
  ].join("\n"))})
  gitStatus.onCall(1).returns({on: (_, f) => f([
    "M filename",
    "?? filename2",
    "",
  ].join("\n"))})
  gitDiff.resolves("+ 1")
  gitLog.resolves([
    "123qwe - commmit msg1",
    "124qwe - commmit msg2",
    "125qwe - commmit msg3",
    "",
  ].join("\n"))

  const output = render(<Status initialLines={initialLines} />)

  await delay()
  output.stdin.write("j")
  output.stdin.write(ARROW_DOWN)
  output.stdin.write("j")
  output.stdin.write("k")
  output.stdin.write(ARROW_UP)

  t.deepEqual(output.frames, [
    res1,
    res2,
    res1,
    res2,
    res1,
    res2,
  ].map(x => x.join("\n")))

  output.stdin.write("s")
  await delay()
  t.truthy(runCommand.called)
  await delay()

  t.deepEqual(output.lastFrame(), res3.join("\n"))

  output.stdin.write("r")
  await delay()
  t.deepEqual(output.lastFrame(), res4.join("\n"))

  output.stdin.write("k")
  output.stdin.write("f")
  await delay()
  t.deepEqual(output.lastFrame(), res5.join("\n"))
})
