import React, {useReducer} from "react"
import test from "ava"
import {render} from "ink-testing-library"
import sinon from "sinon"

import Status from "commands/status/View"
import reducer, {getActions} from "commands/status/reducer"
import * as g from "git-utils"

const delay = (n = 100) => new Promise(r => setTimeout(r, n))

let gitStatus
let gitHasStagedFiles
let gitLog

test.beforeEach(_ => {
  gitStatus = sinon.stub(g, "gitStatus")
  gitHasStagedFiles = sinon.stub(g, "gitHasStagedFiles")
  gitLog = sinon.stub(g, "gitLog")
})

test.afterEach(_ => {
  gitStatus.restore()
  gitHasStagedFiles.restore()
  gitLog.restore()
})

test.serial("should render view", t => {
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
        mode: "status",
        selected: 0,
        allSelected: false,
        log: [],
        lines: initialLines,
      }}
    />,
  )

  const res = [
    " ❯ M filename",
    "   A filename2",
    "   ?? filename3",
  ].join("\n")

  t.deepEqual(output.lastFrame(), res)
})

test.serial("should react on key presses", async t => {
  const initialLines = [
    "M filename",
    "?? filename2",
    "M filename3",
  ]

  const ARROW_UP = "\u001B[A"
  const ARROW_DOWN = "\u001B[B"

  const res1 = [
    " ❯ ?? filename2",
    "   M filename",
  ]
  const res2 = [
    "   ?? filename2",
    " ❯ M filename",
  ]
  const res3 = [
    " ❯ A filename2",
    "   M filename",
  ]
  const res5 = [
    " ❯ 123qwe - commmit msg1",
    "   124qwe - commmit msg2",
    "   125qwe - commmit msg3",
  ]
  const res4 = [
    "   123qwe - commmit msg1",
    " ❯ 124qwe - commmit msg2",
    "   125qwe - commmit msg3",
  ]
  const res6 = [
    " ❯ ?? filename2",
    " ❯ M filename",
  ]
  const res7 = [
    " ❯ M filename3",
    " ❯ A filename2",
    " ❯ M filename",
  ]
  const res8 = [
    " ❯ M filename3",
    " ❯ ?? filename2",
    " ❯ M filename",
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
  gitStatus.onCall(4).resolves([
    "M filename",
    "A filename2",
    "M filename3",
    "",
  ].join("\n"))
  gitStatus.onCall(5).resolves([
    "M filename",
    "?? filename2",
    "M filename3",
    "",
  ].join("\n"))
  gitStatus.onCall(6).resolves([
    "?? filename2",
    "M filename",
    "",
  ].join("\n"))
  gitStatus.onCall(7).resolves([
    "?? filename2",
    "M filename",
    "",
  ].join("\n"))
  gitStatus.onCall(8).resolves([
    "?? filename2",
    "M filename",
    "",
  ].join("\n"))
  gitStatus.onCall(9).resolves("")

  gitHasStagedFiles.resolves(true)
  gitLog.resolves([
    "123qwe - commmit msg1",
    "124qwe - commmit msg2",
    "125qwe - commmit msg3",
    "",
  ].join("\n"))

  const App = () => {
    const initialState = {
      mode: "status",
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
  t.deepEqual(output.lastFrame(), res2.join("\n"))

  await delay()
  output.stdin.write("j")
  output.stdin.write(ARROW_DOWN)
  output.stdin.write("j")
  output.stdin.write("k")
  output.stdin.write(ARROW_UP)

  t.deepEqual(output.frames.slice(3), [
    res2,
    res1,
    res2,
    res1,
    res2,
    res1,
  ].map(x => x.join("\n")))

  await delay()
  output.stdin.write("a")
  await delay()
  t.deepEqual(output.lastFrame(), res6.join("\n"))

  output.stdin.write("a")
  await delay()
  output.stdin.write("s")
  output.stdin.write("s")
  await delay()
  t.deepEqual(output.lastFrame(), res3.join("\n"))

  output.stdin.write("a")
  output.stdin.write("r")
  await delay()
  t.deepEqual(output.lastFrame(), res6.join("\n"))

  output.stdin.write("k")
  output.stdin.write("f")
  await delay()
  t.deepEqual(output.lastFrame(), res5.join("\n"))

  output.stdin.write("j")
  await delay()
  t.deepEqual(output.lastFrame(), res4.join("\n"))

  output.stdin.write("k")
  await delay()
  t.deepEqual(output.lastFrame(), res5.join("\n"))

  output.stdin.write("q")

  const output2 = render(<App />)

  await delay()
  output2.stdin.write("a")
  await delay()
  output2.stdin.write("s")
  await delay()
  t.deepEqual(output2.lastFrame(), res7.join("\n"))

  await delay()
  output2.stdin.write("r")
  await delay()
  t.deepEqual(output2.lastFrame(), res8.join("\n"))

  output2.stdin.write("a")
  output2.stdin.write("o")
  await delay()
  t.deepEqual(output2.lastFrame(), res1.join("\n"))
})
