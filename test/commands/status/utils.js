import test from "ava"
import sinon from "sinon"

import p from "process"
import * as g from "git-utils"
import {runCommand, commit, commitFixup, commitAmend, updateLog} from "commands/status/utils"

const gs = sinon.stub(g)
const pauseSpy = sinon.spy(p.stdin, "pause")

test("runCommand", async t => {
  gs.runCmd.resolves(1)
  gs.gitStatus.resolves("A 1.js\n")
  const update = sinon.spy()

  await runCommand("git add", ["A 1.js\r"], update)

  t.truthy(gs.runCmd.calledWith({params: ["git add", "1.js"]}))
  t.truthy(gs.gitStatus.called)
  t.truthy(update.calledWith(["A 1.js"]))
})

test("commit", async t => {
  gs.gitDiff.returns("+ 1")
  const exit = sinon.spy()

  commit(exit)
  await t.truthy(gs.gitDiff.called)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommit.called)
  t.truthy(exit.called)
})

test("commit fixup", async t => {
  const exit = sinon.spy()

  commitFixup("123zxc", exit)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommitFixup.calledWith("123zxc"))
  t.truthy(exit.called)
})

test("commit amend", async t => {
  gs.gitDiff.returns("+ 1")
  const exit = sinon.spy()

  commitAmend(exit)
  await t.truthy(gs.gitDiff.called)
  t.truthy(pauseSpy.called)
  await t.truthy(gs.gitCommitAmend.called)
  t.truthy(exit.called)
})

test("updateLog", async t => {
  gs.gitLog.returns("123zxc commit msg\n")
  const update = sinon.spy()

  await updateLog(update)
  t.truthy(update.calledWith(["123zxc commit msg"]))
})
