import test from "ava"
import sinon from "sinon"

import p from "process"
import * as g from "git-utils"
import * as u from "utils"
import {
  preRender,
  getData,
  getHint,
  runCommand,
  commit,
  commitFixup,
  commitAmend,
  updateLog,
  handleInput,
} from "commands/status"

const gs = sinon.stub(g)
let pauseSpy

test.beforeEach(_ => {
  pauseSpy = sinon.spy(p.stdin, "pause")
})

test.afterEach(_ => {
  pauseSpy.restore()
})

test.serial("should run command", async t => {
  gs.runCmd.resolves(1)
  gs.gitStatus.resolves("A 1.js\n")
  const update = sinon.spy()

  await runCommand("git add", ["A 1.js\r"], update)

  t.truthy(gs.runCmd.calledWith({params: ["git add", "1.js"]}))
  t.truthy(gs.gitStatus.called)
  t.truthy(update.calledWith(["A 1.js"]))
})

test.serial("should try to commit w/o staging", async t => {
  gs.gitHasStagedFiles.resolves(false)
  const exit = sinon.spy()

  commit(exit)
  await t.truthy(gs.gitHasStagedFiles.called)
  t.falsy(pauseSpy.called)
  await t.falsy(gs.gitCommit.called)
  t.falsy(exit.called)
})

test.serial("should commit", async t => {
  gs.gitHasStagedFiles.resolves(true)
  const exit = sinon.spy()

  commit(exit)
  await t.truthy(gs.gitHasStagedFiles.called)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommit.called)
  t.truthy(exit.called)
})

test.serial("should commit fixup", async t => {
  const exit = sinon.spy()

  commitFixup("123zxc", exit)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommitFixup.calledWith("123zxc"))
  t.truthy(exit.called)
})

test.serial("should try to commit amend w/o staging", async t => {
  gs.gitHasStagedFiles.resolves(false)
  const exit = sinon.spy()

  commitAmend(exit)
  await t.truthy(gs.gitHasStagedFiles.called)
  t.falsy(pauseSpy.called)
  await t.falsy(gs.gitCommitAmend.called)
  t.falsy(exit.called)
})

test.serial("should commit amend", async t => {
  gs.gitHasStagedFiles.resolves(true)
  const exit = sinon.spy()

  commitAmend(exit)
  await t.truthy(gs.gitHasStagedFiles.called)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommitAmend.called)
  t.truthy(exit.called)
})

test.serial("should update log", async t => {
  gs.gitLog.returns("123zxc commit msg\n")
  const update = sinon.spy()

  await updateLog(update)
  t.truthy(update.calledWith(["123zxc commit msg"]))
})

test.serial("should quit app on q", async t => {
  const exit = sinon.spy()
  await handleInput({exit})("q", {})

  t.truthy(exit.called)
})

test.serial("should select all on a", t => {
  const toggleSelectAll = sinon.spy()

  handleInput({mode: "status", toggleSelectAll})("a", {})
  t.is(toggleSelectAll.callCount, 1)

  handleInput({mode: "status", toggleSelectAll})("a", {})
  t.is(toggleSelectAll.callCount, 2)
})

test.serial("should stage items on s", t => {
  const runCommand = sinon.spy()
  const setFiles = sinon.spy()
  const files = ["1", "2", "3"]

  handleInput({
    mode: "status",
    allSelected: false,
    selected: 0,
    files,
    setFiles,
    runCommand,
  })("s", {})

  t.truthy(runCommand.calledWith("add", ["1"], setFiles))

  handleInput({
    mode: "status",
    allSelected: true,
    files,
    setFiles,
    runCommand,
  })("s", {})

  t.truthy(runCommand.calledWith("add", ["1", "2", "3"], setFiles))
})

test.serial("should unstage items on r", t => {
  const runCommand = sinon.spy()
  const setFiles = sinon.spy()
  const files = ["1", "2", "3"]

  handleInput({
    mode: "status",
    allSelected: false,
    selected: 0,
    files,
    setFiles,
    runCommand,
  })("r", {})

  t.truthy(runCommand.calledWith("reset", ["1"], setFiles))

  handleInput({
    mode: "status",
    allSelected: true,
    files,
    setFiles,
    runCommand,
  })("r", {})

  t.truthy(runCommand.calledWith("reset", ["1", "2", "3"], setFiles))
})

test.serial("should checkout items on o", async t => {
  const runCommand = sinon.stub()
  const selectItem = sinon.spy()
  const setFiles = sinon.spy()
  const exit = sinon.spy()
  const files = ["1", "2", "3"]

  runCommand.onCall(0).resolves(["2", "3"])
  runCommand.onCall(1).resolves([])
  runCommand.onCall(2).resolves([])

  await handleInput({
    mode: "status",
    allSelected: false,
    selected: 0,
    files,
    setFiles,
    runCommand,
    selectItem,
  })("o", {})

  t.truthy(runCommand.calledWith("checkout", ["1"], setFiles))
  t.truthy(selectItem.called)

  await handleInput({
    mode: "status",
    allSelected: false,
    selected: 0,
    files: [files[0]],
    setFiles,
    runCommand,
    selectItem,
    exit,
  })("o", {})

  t.truthy(runCommand.calledWith("checkout", ["1"], setFiles))
  t.truthy(exit.called)

  await handleInput({
    mode: "status",
    allSelected: true,
    files,
    setFiles,
    runCommand,
    selectItem,
    exit,
  })("o", {})

  t.truthy(runCommand.calledWith("checkout", ["1", "2", "3"], setFiles))
  t.truthy(exit.called)
})

test.serial("should commit on c", t => {
  const commit = sinon.spy()
  const exit = sinon.spy()

  handleInput({mode: "status", commit, exit})("c", {})
  t.truthy(commit.calledWith(exit))
})

test.serial("should commit --amend on m", t => {
  const commitAmend = sinon.spy()
  const exit = sinon.spy()

  handleInput({mode: "status", commitAmend, exit})("m", {})
  t.truthy(commitAmend.calledWith(exit))
})

test.serial("should open git log on f", async t => {
  gs.gitHasStagedFiles.resolves(true)

  const updateLog = sinon.spy()
  const setLog = sinon.spy()
  const setMode = sinon.spy()
  const selectItem = sinon.spy()

  await handleInput({mode: "status", updateLog, setLog, setMode, selectItem})("f", {})

  t.truthy(updateLog.calledWith(setLog))
  t.truthy(setMode.calledWith("log"))
  t.is(selectItem.callCount, 1)
})

test.serial("should commit --fixup on enter in log", async t => {
  const exit = sinon.spy()
  const commitFixup = sinon.spy()
  const log = ["1", "2"]
  const selected = 0

  await handleInput({mode: "log", commitFixup, exit, log, selected})("", {return: true})

  t.truthy(commitFixup.calledWith("1", exit))
})

test.serial("should return hint", async t => {
  const hint = getHint()

  const res = [
    "",
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
  ].join("\n")

  t.deepEqual(hint, res)
})

test.serial("should pre-render view", async t => {
  const stdout = sinon.stub(process.stdout)
  const write = sinon.spy()
  stdout.columns = 30
  stdout.write = write

  preRender(getHint())(["M filename"])(20)(0)

  const res = [
    "",
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
    " ❯ M filename",
    "",
    "",
  ].join("\n")

  t.truthy(write.calledWith(res))
})

test.serial("should get data", async t => {
  const statusStrToList = sinon.stub(u, "statusStrToList")
  gs.gitStatus.resolves("status")

  await getData()

  t.truthy(gs.isGitRepo.called)
  t.truthy(gs.gitStatus.called)
  t.truthy(statusStrToList.calledWith("status"))

  statusStrToList.restore()
})
