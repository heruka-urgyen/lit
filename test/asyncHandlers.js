import test from "ava"
import sinon from "sinon"

import p from "process"
import * as g from "git-utils"

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
  gs.gitStatusPorcelain.resolves("1 A 1.js\n")
  gs.isPathRelative.resolves(true)
  const cmd = sinon.spy()

  await runCommand(cmd, ["A 1.js\r"])

  t.true(cmd.called)
  t.true(gs.gitStatusPorcelain.called)
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
