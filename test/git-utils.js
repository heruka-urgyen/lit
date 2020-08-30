import test from "ava"
import sinon from "sinon"

import * as pty from "node-pty"
import * as cp from "child_process"
import {
  runCmd,
  gitStatus,
  gitCommit,
  gitCommitFixup,
  gitCommitAmend,
  gitHasStagedFiles,
  gitLog,
  isGitRepo,
  getPager,
  gitCheckout,
} from "git-utils"

let spawnSpy
let cpSpawnSpy
let cpExecSpy

test.beforeEach(_ => {
  spawnSpy = sinon.stub(pty, "spawn")
  cpSpawnSpy = sinon.stub(cp, "spawn")
  cpExecSpy = sinon.stub(cp, "exec")

  spawnSpy.returns({on: _ => _})
  cpSpawnSpy.returns(0)
  cpExecSpy.returns(0)
})

test.afterEach(_ => {
  spawnSpy.restore()
  cpSpawnSpy.restore()
  cpExecSpy.restore()
})

test.serial("should runCmd w/ no args", t => {
  runCmd({})
  t.truthy(spawnSpy.calledWith("git"))
})

test.serial("should runCmd w/ args", t => {
  runCmd({params: ["status"]})
  t.truthy(spawnSpy.calledWith("git", ["status"]))
})

test.serial("should show gitStatus", t => {
  gitStatus()
  t.truthy(spawnSpy.calledWith("git", ["-c", "color.ui=always", "status", "-s", "-u"]))
})

test.serial("should gitCommit w/ no args", t => {
  gitCommit()
  t.truthy(cpSpawnSpy.calledWith("git", ["commit"], {stdio: "inherit"}))
})

test.serial("should gitCommit", t => {
  gitCommit(["1.js", "2.js"])
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "1.js", "2.js"], {stdio: "inherit"}))
})

test.serial("should gitCommitFixup", t => {
  gitCommitFixup("123zxc")
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "--fixup", "123zxc"], {stdio: "inherit"}))
})

test.serial("should gitCommitAmend", t => {
  gitCommitAmend(["1.js"])
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "--amend"], {stdio: "inherit"}))
})

test.serial("should gitHasStagedFiles", async t => {
  gitHasStagedFiles()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git diff --cached --name-only")
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})

test.serial("should gitLog", async t => {
  gitLog()

  t.deepEqual(
    cpExecSpy.lastCall.args[0],
    "git log --color=always --format=" +
    "'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'",
  )
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})

test.serial("should isGitRepo", async t => {
  isGitRepo()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git rev-parse --is-inside-work-tree")
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})

test.serial("should call getPager", async t => {
  spawnSpy.onCall(0).returns({on: (_, f) => f()})
  spawnSpy.onCall(1).returns({on: (_, f) => f("some-pager")})
  spawnSpy.onCall(2).returns({on: (_, f) => f("delta")})
  const pagerSpy = {on: sinon.spy()}
  cpSpawnSpy.returns(pagerSpy)

  const pager1 = await getPager()
  const pager2 = await getPager()
  const pager3 = await getPager()

  t.truthy(spawnSpy.calledWith("git", ["config", "--get", "core.pager"]))
  t.is(pager1, null)
  t.is(pager2, null)
  t.truthy(cpSpawnSpy.calledWith("delta", ["--color-only"]))
  t.is(pager3, pagerSpy)
})

test.serial("should gitCheckout", async t => {
  await gitCheckout(["123bc50"])

  t.truthy(cpSpawnSpy.calledWith("git", ["checkout", "123bc50"], {stdio: "inherit"}))
})
