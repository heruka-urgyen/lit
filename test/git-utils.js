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
  gitDiff,
  gitLog,
  isGitRepo,
} from "git-utils"

let spawnSpy
let cpSpawnSpy
let cpExecSpy

test.beforeEach(_ => {
  spawnSpy = sinon.stub(pty, "spawn")
  cpSpawnSpy = sinon.stub(cp, "spawn")
  cpExecSpy = sinon.stub(cp, "exec")

  spawnSpy.returns(0)
  cpSpawnSpy.returns(0)
  cpExecSpy.returns(0)
})

test.afterEach(_ => {
  spawnSpy.restore()
  cpSpawnSpy.restore()
  cpExecSpy.restore()
})

test.serial("runCmd no args", t => {
  runCmd({})
  t.truthy(spawnSpy.calledWith("git"))
})

test.serial("runCmd", t => {
  runCmd({params: ["status"]})
  t.truthy(spawnSpy.calledWith("git", ["status"]))
})

test.serial("gitStatus", t => {
  gitStatus()
  t.truthy(spawnSpy.calledWith("git", ["-c", "color.ui=always", "status", "-s", "-u"]))
})

test.serial("gitCommit no args", t => {
  gitCommit()
  t.truthy(cpSpawnSpy.calledWith("git", ["commit"], {stdio: "inherit"}))
})

test.serial("gitCommit", t => {
  gitCommit(["1.js", "2.js"])
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "1.js", "2.js"], {stdio: "inherit"}))
})

test.serial("gitCommitFixup", t => {
  gitCommitFixup("123zxc")
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "--fixup", "123zxc"], {stdio: "inherit"}))
})

test.serial("gitCommitAmend", t => {
  gitCommitAmend(["1.js"])
  t.truthy(cpSpawnSpy.calledWith("git", ["commit", "--amend"], {stdio: "inherit"}))
})

test.serial("gitDiff", async t => {
  gitDiff()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git diff --cached --name-only")
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})

test.serial("gitLog", async t => {
  gitLog()

  t.deepEqual(
    cpExecSpy.lastCall.args[0],
    "git log --color=always --format=" +
    "'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'",
  )
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})

test.serial("isGitRepo", async t => {
  isGitRepo()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git rev-parse --is-inside-work-tree")
  t.deepEqual(cpExecSpy.lastCall.args[1], {encoding: "utf8"})
  t.deepEqual(typeof cpExecSpy.lastCall.args[2], "function")
})
