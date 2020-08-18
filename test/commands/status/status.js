import React, {useReducer} from "react"
import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"
import {render} from "ink-testing-library"
import sinon from "sinon"
import chalk from "chalk"

import Status from "commands/status/View"
import reducer, {getActions} from "commands/status/reducer"
import * as s from "commands/status/utils"
import * as g from "git-utils"

const delay = (n = 100) => new Promise(r => setTimeout(r, n))

let runCommand
let gitStatus
let gitHasStagedFiles
let gitLog

test.beforeEach(_ => {
  runCommand = sinon.spy(s, "runCommand")
  gitStatus = sinon.stub(g, "gitStatus")
  gitHasStagedFiles = sinon.stub(g, "gitHasStagedFiles")
  gitLog = sinon.stub(g, "gitLog")
})

test.afterEach(_ => {
  s.runCommand.restore()
  gitStatus.restore()
  gitHasStagedFiles.restore()
  gitLog.restore()
})

test("pre-render view", async t => {
  const {preRender, getHint} = await import("commands/status/prepare")
  const output = stdout.inspectSync(() => {
    preRender(getHint(chalk))(["M filename"])(20)
  })

  const res = [
    "",
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
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
  const output = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={{}}
      state={{
        mode: "add",
        selected: 0,
        allSelected: false,
        log: [],
        lines: initialLines,
      }}
    />,
  )

  const res = [
    "",
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
    "M filename3",
  ]

  const ARROW_UP = "\u001B[A"
  const ARROW_DOWN = "\u001B[B"

  const res1 = [
    "",
    " ❯ ?? filename2",
    "   M filename",
  ]
  const res2 = [
    "",
    "   ?? filename2",
    " ❯ M filename",
  ]
  const res3 = [
    "",
    "   A filename2",
    " ❯ M filename",
  ]
  const res4 = [
    "",
    "   ?? filename2",
    " ❯ M filename",
  ]
  const res5 = [
    "",
    " ❯ 123qwe - commmit msg1",
    "   124qwe - commmit msg2",
    "   125qwe - commmit msg3",
  ]

  gitStatus.onCall(0).resolves([
    "M filename",
    "?? filename2",
    "",
  ].join("\n"))
  gitStatus.onCall(1).resolves([
    "M filename",
    "?? filename2",
    "",
  ].join("\n"))
  gitStatus.onCall(2).resolves([
    "M filename",
    "A filename2",
    "",
  ].join("\n"))
  gitStatus.onCall(3).resolves([
    "M filename",
    "?? filename2",
    "",
  ].join("\n"))
  gitHasStagedFiles.resolves(true)
  gitLog.resolves([
    "123qwe - commmit msg1",
    "124qwe - commmit msg2",
    "125qwe - commmit msg3",
    "",
  ].join("\n"))

  const App = () => {
    const initialState = {
      mode: "add",
      selected: 0,
      allSelected: false,
      log: [],
      lines: initialLines,
    }

    const [state, dispatch] = useReducer(reducer, initialState)
    const actions = getActions(dispatch)

    return (
      <Status
        minHeight={0}
        maxHeight={20}
        state={state}
        actions={actions}
      />
    )
  }

  const output = render(<App />)

  await delay()
  output.stdin.write("k")
  output.stdin.write("o")
  await delay()
  t.deepEqual(output.lastFrame(), res1.join("\n"))

  await delay()
  output.stdin.write("j")
  output.stdin.write(ARROW_DOWN)
  output.stdin.write("j")
  output.stdin.write("k")
  output.stdin.write(ARROW_UP)

  t.deepEqual(output.frames.slice(3), [
    res1,
    res2,
    res1,
    res2,
    res1,
    res2,
  ].map(x => x.join("\n")))

  await delay()
  output.stdin.write("s")
  output.stdin.write("s")
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
