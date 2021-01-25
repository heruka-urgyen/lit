/* eslint-disable react/jsx-props-no-spreading */

import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"
import React from "react"
import {useInput} from "ink"
import {render} from "ink-testing-library"
import {delay} from "utils"

import inputHandlers from "inputHandlers"
import * as ah from "asyncHandlers"
import * as gu from "git-utils"

const press = output => async key => {
  output.stdin.write(key)
  await delay(0)
}

const toCommitMsg =
  ([hash, msg, t, author]) => `${hash} - ${msg} (${t} days ago) <${author}>`

const App = ({actions, ...props}) => {
  const {mode, modes, allSelected, selected, files, data} = props
  const state = {
    app: {mode, modes},
    status: {allSelected, selected, files},
    log: {data, selected},
  }
  useInput(inputHandlers({actions, state}))

  return null
}

testProp.serial(
  "should quit app",
  [fc.oneof(fc.constant("status"), fc.constant("diff"), fc.constant("log"))],
  async (t, mode) => {
    const actions = {
      exit: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("q")
    t.is(actions.exit.callCount, 1)
  },
)

testProp.serial(
  "should select all in status or diff",
  [
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.oneof(fc.constant("log"), fc.hexaString()),
  ],
  async (t, passMode, failMode) => {
    const actions = {
      toggleSelectAll: sinon.spy(),
    }
    const stateS = {
      mode: passMode,
      modes: [],
    }
    const stateF1 = {
      mode: failMode,
      modes: [],
    }
    const stateF2 = {
      mode: "diff",
      modes: ["log"],
    }

    const outputS = render(<App actions={actions} {...stateS} />)
    const outputF1 = render(<App actions={actions} {...stateF1} />)
    const outputF2 = render(<App actions={actions} {...stateF2} />)

    await delay(0)

    await press(outputF1)("a")
    t.is(actions.toggleSelectAll.callCount, 0)

    await press(outputF2)("a")
    t.is(actions.toggleSelectAll.callCount, 0)

    await press(outputS)("a")
    t.is(actions.toggleSelectAll.callCount, 1)
  },
)

testProp.serial(
  "should git add files in status or diff",
  [
    fc.constant(sinon.spy()),
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.oneof(fc.constant("log"), fc.hexaString()),
  ],
  async (t, setFiles, passMode, failMode) => {
    const runCommand = sinon.stub(ah, "runCommand")

    const actions = {
      setFiles,
    }
    const state1 = {
      modes: [],
      allSelected: false,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state2 = {
      modes: [],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state3 = {
      modes: ["log"],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }

    const outputS1 = render(<App actions={actions} mode={passMode} {...state1} />)
    const outputS2 = render(<App actions={actions} mode={passMode} {...state2} />)
    const outputF1 = render(<App actions={actions} mode={failMode} {...state1} />)
    const outputF2 = render(<App actions={actions} mode={passMode} {...state3} />)

    await delay(0)

    await press(outputF1)("s")
    t.is(runCommand.callCount, 0)

    await press(outputF2)("s")
    t.is(runCommand.callCount, 0)

    await press(outputS1)("s")
    t.true(runCommand.calledWith(gu.gitAdd, ["M 1"]))

    await press(outputS2)("s")
    t.true(runCommand.calledWith(gu.gitAdd, ["M 1", "M 2"]))

    runCommand.restore()
  },
)

testProp.serial(
  "should git reset files in status or diff",
  [
    fc.constant(sinon.spy()),
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.hexaString(),
  ],
  async (t, setFiles, passMode, failMode) => {
    const runCommand = sinon.stub(ah, "runCommand")

    const actions = {
      setFiles,
    }
    const state1 = {
      modes: [],
      allSelected: false,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state2 = {
      modes: [],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state3 = {
      modes: ["log"],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }

    const outputS1 = render(<App actions={actions} mode={passMode} {...state1} />)
    const outputS2 = render(<App actions={actions} mode={passMode} {...state2} />)
    const outputF1 = render(<App actions={actions} mode={failMode} {...state1} />)
    const outputF2 = render(<App actions={actions} mode={passMode} {...state3} />)

    await delay(0)

    await press(outputF1)("r")
    t.is(runCommand.callCount, 0)

    await press(outputF2)("r")
    t.is(runCommand.callCount, 0)

    await press(outputS1)("r")
    t.true(runCommand.calledWith(gu.gitReset, ["M 1"]))

    await press(outputS2)("r")
    t.true(runCommand.calledWith(gu.gitReset, ["M 1", "M 2"]))

    runCommand.restore()
  },
)

testProp.serial(
  "should git checkout files in status or diff",
  [
    fc.constant(sinon.spy()),
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.hexaString(),
  ],
  async (t, setFiles, passMode, failMode) => {
    const runCommand = sinon.stub(ah, "runCommand")

    runCommand.onCall(0).resolves(["M 2"])
    runCommand.onCall(1).resolves([])
    runCommand.onCall(2).resolves([])

    const actions = {
      exit: sinon.spy(),
      selectItem: sinon.spy(),
      setFiles,
    }
    const state1 = {
      modes: [],
      allSelected: false,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state2 = {
      modes: [],
      allSelected: false,
      selected: 0,
      files: ["M 2"],
    }
    const state3 = {
      modes: [],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }
    const state4 = {
      modes: ["log"],
      allSelected: true,
      selected: 0,
      files: ["M 1", "M 2"],
    }

    const outputS1 = render(<App actions={actions} mode={passMode} {...state1} />)
    const outputS2 = render(<App actions={actions} mode={passMode} {...state2} />)
    const outputS3 = render(<App actions={actions} mode={passMode} {...state3} />)
    const outputF1 = render(<App actions={actions} mode={failMode} {...state1} />)
    const outputF2 = render(<App actions={actions} mode={passMode} {...state4} />)

    await delay(0)

    await press(outputF1)("o")
    t.is(runCommand.callCount, 0)

    await press(outputF2)("o")
    t.is(runCommand.callCount, 0)

    await press(outputS1)("o")
    t.true(runCommand.calledWith(gu.gitCheckout, ["M 1"]))
    t.is(actions.selectItem.callCount, 1)

    await press(outputS2)("o")
    t.true(runCommand.calledWith(gu.gitCheckout, ["M 2"]))
    t.is(actions.exit.callCount, 1)

    await press(outputS3)("o")
    t.true(runCommand.calledWith(gu.gitCheckout, ["M 1", "M 2"]))
    t.is(actions.exit.callCount, 2)

    runCommand.restore()
  },
)

testProp.serial(
  "should git commit",
  [
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.oneof(fc.constant("log"), fc.hexaString()),
  ],
  async (t, passMode, failMode) => {
    const commit = sinon.stub(ah, "commit")
    const actions = {
      exit: sinon.spy(),
    }

    const outputS = render(<App actions={actions} mode={passMode} modes={[]} />)
    const outputF1 = render(<App actions={actions} mode={failMode} modes={[]} />)
    const outputF2 = render(<App actions={actions} mode={passMode} modes={["log"]} />)

    await delay(0)

    await press(outputF1)("c")
    t.is(commit.callCount, 0)

    await press(outputF2)("c")
    t.is(commit.callCount, 0)

    await press(outputS)("c")
    t.true(commit.calledWith(actions.exit))

    commit.restore()
  },
)

testProp.serial(
  "should git commit --amend",
  [
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.oneof(fc.constant("log"), fc.hexaString()),
  ],
  async (t, passMode, failMode) => {
    const commitAmend = sinon.stub(ah, "commitAmend")
    const actions = {
      exit: sinon.spy(),
    }

    const outputS = render(<App actions={actions} mode={passMode} modes={[]} />)
    const outputF1 = render(<App actions={actions} mode={failMode} modes={[]} />)
    const outputF2 = render(<App actions={actions} mode={failMode} modes={["log"]} />)

    await delay(0)

    await press(outputF1)("m")
    t.is(commitAmend.callCount, 0)

    await press(outputF2)("m")
    t.is(commitAmend.callCount, 0)

    await press(outputS)("m")
    t.true(commitAmend.calledWith(actions.exit))

    commitAmend.restore()
  },
)

testProp.serial(
  "should open git log from status or diff",
  [
    fc.oneof(fc.constant("status"), fc.constant("diff")),
    fc.oneof(fc.constant("log"), fc.hexaString()),
  ],
  async (t, passMode, failMode) => {
    const updateLog = sinon.stub(ah, "updateLog")
    const gitHasStagedFiles = sinon.stub(gu, "gitHasStagedFiles")
    gitHasStagedFiles.resolves(true)

    const actions = {
      exit: sinon.spy(),
      setLog: sinon.spy(),
      setMode: sinon.spy(),
      setWidth: sinon.spy(),
      selectItem: sinon.spy(),
    }

    const outputS = render(<App actions={actions} mode={passMode} modes={[]} />)
    const outputF1 = render(<App actions={actions} mode={failMode} modes={[]} />)
    const outputF2 = render(<App actions={actions} mode={failMode} modes={["log"]} />)

    await delay(0)

    await press(outputF1)("f")
    t.is(updateLog.callCount, 0)
    t.is(actions.setMode.callCount, 0)
    t.is(actions.selectItem.callCount, 0)
    t.is(actions.setWidth.callCount, 0)

    await press(outputF2)("f")
    t.is(updateLog.callCount, 0)
    t.is(actions.setMode.callCount, 0)
    t.is(actions.selectItem.callCount, 0)
    t.is(actions.setWidth.callCount, 0)

    await press(outputS)("f")
    t.true(actions.setMode.calledWith("fixup"))
    await delay(0)
    t.true(updateLog.calledWith(actions.setLog))
    t.is(actions.selectItem.callCount, 1)
    t.is(actions.setWidth.callCount, 1)

    updateLog.restore()
    gitHasStagedFiles.restore()
  },
)

testProp.serial(
  "should show preview in diff mode",
  [fc.oneof(fc.constant("status"), fc.constant("diff"), fc.constant("log"), fc.hexaString())],
  async (t, mode) => {
    const actions = {
      setMode: sinon.spy(),
      setWidth: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("v")
    if (mode === "diff") {
      t.true(actions.setMode.calledWith("preview"))
    } else {
      t.is(actions.setMode.callCount, 0)
    }
  },
)

testProp.serial(
  "should hide preview in preview mode",
  [fc.oneof(
    fc.constant("status"),
    fc.constant("preview"),
    fc.constant("log"),
    fc.hexaString(),
  )],
  async (t, mode) => {
    const actions = {
      setMode: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("v")
    if (mode === "preview") {
      t.true(actions.setMode.calledWith("diff"))
    } else {
      t.is(actions.setMode.callCount, 0)
    }
  },
)

testProp.serial(
  "should go back to log in diff mode",
  [fc.oneof(fc.constant("status"), fc.constant("diff"), fc.hexaString())],
  async (t, mode) => {
    const actions = {
      setMode: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("b")
    if (mode === "diff") {
      t.true(actions.setMode.calledWith("log"))
    } else {
      t.is(actions.setMode.callCount, 0)
    }
  },
)

testProp.serial(
  "should resize preview in diff mode",
  [fc.oneof(fc.constant("status"), fc.constant("diff"), fc.constant("log"), fc.hexaString())],
  async (t, mode) => {
    const actions = {
      setWidth: sinon.spy(),
      setFiles: sinon.spy(),
      setMode: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("h")
    if (mode === "diff") {
      t.is(actions.setWidth.callCount, 1)
    } else {
      t.is(actions.setWidth.callCount, 0)
    }

    await press(output)("leftArrow")
    if (mode === "diff") {
      t.is(actions.setWidth.callCount, 2)
    } else {
      t.is(actions.setWidth.callCount, 0)
    }

    await press(output)("l")
    if (mode === "diff") {
      t.is(actions.setWidth.callCount, 3)
    } else {
      t.is(actions.setWidth.callCount, 0)
    }

    await press(output)("rightArrow")
    if (mode === "diff") {
      t.is(actions.setWidth.callCount, 4)
    } else {
      t.is(actions.setWidth.callCount, 0)
    }
  },
)

testProp.serial(
  "should scroll preview in preview mode",
  [fc.oneof(fc.constant("preview"), fc.constant("diff"), fc.hexaString())],
  async (t, mode) => {
    const actions = {
      scrollPreview: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} />)

    await delay(0)

    await press(output)("j")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 1)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("downArrow")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 2)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("k")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 3)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("upArrow")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 4)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("d")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 5)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("u")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 6)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("G")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 7)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }

    await press(output)("g")
    await press(output)("g")
    if (mode === "preview") {
      t.is(actions.scrollPreview.callCount, 8)
    } else {
      t.is(actions.scrollPreview.callCount, 0)
    }
  },
)

testProp.serial(
  "should select commit for fixup in fixup mode",
  [fc.oneof(fc.constant("status"), fc.constant("fixup"), fc.hexaString())],
  async (t, mode) => {
    const commitFixup = sinon.stub(ah, "commitFixup")
    const actions = {
      exit: sinon.spy(),
      setFiles: sinon.spy(),
      setMode: sinon.spy(),
    }
    const state0 = {
      mode,
      modes: [],
      data: ["123zxc1", "t63j0c4"],
      selected: 0,
    }
    const state1 = {
      mode,
      modes: ["status"],
      data: ["123zxc1", "t63j0c4"],
      selected: 0,
    }
    const state2 = {
      mode,
      modes: ["diff"],
      data: ["123zxc1", "t63j0c4"],
      selected: 0,
    }

    const output0 = render(<App actions={actions} {...state0} />)
    const output1 = render(<App actions={actions} {...state1} />)
    const output2 = render(<App actions={actions} {...state2} />)

    await delay(0)

    await press(output0)("return")
    t.is(commitFixup.callCount, 0)

    await press(output1)("return")
    if (mode === "fixup") {
      t.true(commitFixup.calledWith("123zxc1", actions.exit))
    } else {
      t.is(commitFixup.callCount, 0)
    }

    await press(output2)("return")
    if (mode === "fixup") {
      t.true(commitFixup.calledWith("123zxc1", actions.exit))
    } else {
      t.is(commitFixup.callCount, 0)
    }

    commitFixup.restore()
  },
)

testProp.serial(
  "should go back to status in fixup mode",
  [fc.oneof(fc.constant("status"), fc.constant("fixup"), fc.hexaString())],
  async (t, mode) => {
    const actions = {
      setMode: sinon.spy(),
    }

    const output = render(<App actions={actions} mode={mode} modes={["status"]} />)

    await delay(0)

    await press(output)("b")

    if (mode === "fixup") {
      t.true(actions.setMode.calledWith("status"))
    } else {
      t.is(actions.setMode.callCount, 0)
    }
  },
)

testProp.serial(
  "should checkout commit in log mode",
  [
    fc.integer(1, 10).chain(max => fc.tuple(
      fc.nat(max - 1),
      fc.array(
        fc.tuple(
          fc.hexaString(7, 7),
          fc.unicodeString(1),
          fc.integer(1, 100),
          fc.base64String(1, 10),
        ),
        max,
        max,
      ),
    )),
  ],
  async (t, [selected, commits]) => {
    const gitCheckout = sinon.stub(gu, "gitCheckout")
    const data = commits.map(toCommitMsg)
    const actions = {
      exit: sinon.spy(),
    }
    const state = {
      mode: "log",
      modes: [],
      data,
      selected,
    }

    const output = render(<App actions={actions} {...state} />)

    await delay(0)

    await press(output)("o")
    t.true(gitCheckout.calledWith([commits[selected][0]]))
    t.is(actions.exit.callCount, 1)

    gitCheckout.restore()
  },
)

testProp.serial(
  "should rebase commit in log mode",
  [
    fc.integer(1, 10).chain(max => fc.tuple(
      fc.nat(max - 1),
      fc.array(
        fc.tuple(
          fc.hexaString(7, 7),
          fc.unicodeString(1),
          fc.integer(1, 100),
          fc.base64String(1, 10),
        ),
        max,
        max,
      ),
    )),
  ],
  async (t, [selected, commits]) => {
    const gitRebase = sinon.stub(gu, "gitRebase")
    const data = commits.map(toCommitMsg)

    const actions = {
      exit: sinon.spy(),
    }

    const state = {
      mode: "log",
      modes: [],
      data,
      selected,
    }

    const output = render(<App actions={actions} {...state} />)

    await delay(0)
    await press(output)("r")
    t.true(gitRebase.calledWith(["--interactive", commits[selected][0]]))
    t.is(actions.exit.callCount, 1)

    gitRebase.restore()
  },
)

testProp.serial(
  "should show diff for commit in log mode",
  [
    fc.integer(1, 10).chain(max => fc.tuple(
      fc.nat(max - 1),
      fc.array(
        fc.tuple(
          fc.hexaString(7, 7),
          fc.unicodeString(1),
          fc.integer(1, 100),
          fc.base64String(1, 10),
        ),
        max,
        max,
      ),
    )),
  ],
  async (t, [selected, commits]) => {
    const data = commits.map(toCommitMsg)
    const actions = {
      setFiles: sinon.spy(),
      setMode: sinon.spy(),
    }
    const state = {
      mode: "log",
      modes: [],
      data,
      selected,
    }

    const output = render(<App actions={actions} {...state} />)

    await delay(0)

    await press(output)("l")
    t.true(actions.setFiles.calledWith([]))
    t.true(actions.setMode.calledWith("diff"))

    await press(output)("return")
    t.true(actions.setFiles.calledWith([]))
    t.true(actions.setMode.calledWith("diff"))
  },
)
