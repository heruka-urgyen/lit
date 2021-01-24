import test from "ava"
import sinon from "sinon"

import p from "process"
import * as g from "git-utils"
import * as u from "utils"
import {
  preRender,
  getData,
  getHint,
} from "commands/status"

import {
  runCommand,
  commit,
  commitAmend,
  commitFixup,
  updateLog,
} from "asyncHandlers"

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
  gs.gitStatusPorcelain.resolves("1 A 1.js\n")
  gs.isPathRelative.resolves(true)
  const update = sinon.spy()

  await runCommand("git add", ["A 1.js\r"], update)

  t.true(gs.runCmd.calledWith({params: ["git add", "--", "1.js"]}))
  t.true(gs.gitStatusPorcelain.called)
  t.true(update.calledWith(["A 1.js"]))
})

test.serial("should try to commit w/o staging", async t => {
  gs.gitHasStagedFiles.resolves(false)
  const exit = sinon.spy()

  commit(exit)
  await t.true(gs.gitHasStagedFiles.called)
  t.falsy(pauseSpy.called)
  await t.falsy(gs.gitCommit.called)
  t.falsy(exit.called)
})

test.serial("should commit", async t => {
  gs.gitHasStagedFiles.resolves(true)
  const exit = sinon.spy()

  commit(exit)
  await t.true(gs.gitHasStagedFiles.called)
  t.true(pauseSpy.called)
  await t.true(gs.gitCommit.called)
  t.true(exit.called)
})

test.serial("should commit fixup", async t => {
  const exit = sinon.spy()

  commitFixup("123zxc", exit)
  t.true(pauseSpy.called)
  await t.true(gs.gitCommitFixup.calledWith("123zxc"))
  t.true(exit.called)
})

test.serial("should try to commit amend w/o staging", async t => {
  gs.gitHasStagedFiles.resolves(false)
  const exit = sinon.spy()

  commitAmend(exit)
  await t.true(gs.gitHasStagedFiles.called)
  t.falsy(pauseSpy.called)
  await t.falsy(gs.gitCommitAmend.called)
  t.falsy(exit.called)
})

test.serial("should commit amend", async t => {
  gs.gitHasStagedFiles.resolves(true)
  const exit = sinon.spy()

  commitAmend(exit)
  await t.true(gs.gitHasStagedFiles.called)
  t.true(pauseSpy.called)
  await t.true(gs.gitCommitAmend.called)
  t.true(exit.called)
})

test.serial("should update log", async t => {
  gs.gitLog.returns("123zxc commit msg\n")
  const update = sinon.spy()

  await updateLog(update)
  t.true(update.calledWith(["123zxc commit msg"]))
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

  t.true(write.calledWith(res))
})

test.serial("should render hint", async t => {
  const res1 = [
    "",
    " q quit  | b back to status",
    "",
  ].join("\n")

  const res2 = [
    "",
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
  ].join("\n")

  t.is(getHint("log"), res1)
  t.is(getHint(), res2)
})

test.serial("should get data", async t => {
  const statusStrToList = sinon.stub(u, "statusStrToList")
  gs.gitStatusPorcelain.resolves("status")

  await getData()

  t.true(gs.isGitRepo.called)
  t.true(gs.gitStatusPorcelain.called)
  t.true(statusStrToList.calledWith("status"))

  statusStrToList.restore()
})
