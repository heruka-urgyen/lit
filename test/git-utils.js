import test from "ava"
import sinon from "sinon"

import * as cp from "child_process"
import {
  gitStatusPorcelain,
  gitCommit,
  gitCommitFixup,
  gitCommitAmend,
  gitHasStagedFiles,
  gitLog,
  isGitRepo,
  getPager,
  gitCheckout,
  gitRebase,
  gitRoot,
  isPathRelative,
  gitAdd,
  gitReset,
} from "git-utils"

let cpSpawnSpy
let cpExecSpy

test.beforeEach(_ => {
  cpSpawnSpy = sinon.stub(cp, "spawn")
  cpExecSpy = sinon.stub(cp, "exec")

  cpSpawnSpy.returns({on: _ => _, stdout: {on: _ => _}, stderr: {on: _ => _}})
  cpExecSpy.returns(0)
})

test.afterEach(_ => {
  cpSpawnSpy.restore()
  cpExecSpy.restore()
})

test.serial("should show gitStatus", t => {
  gitStatusPorcelain()
  t.true(cpSpawnSpy.calledWith("git", ["status", "--porcelain=2"]))
})

test.serial("should show gitStatus for a specific file", t => {
  gitStatusPorcelain("abc")
  t.true(cpSpawnSpy.calledWith("git", ["status", "--porcelain=2", "abc"]))
})

test.serial("should gitCommit w/ no args", t => {
  gitCommit()
  t.true(cpSpawnSpy.calledWith("git", ["commit"], {stdio: "inherit"}))
})

test.serial("should gitCommit", t => {
  gitCommit(["1.js", "2.js"])
  t.true(cpSpawnSpy.calledWith("git", ["commit", "1.js", "2.js"], {stdio: "inherit"}))
})

test.serial("should gitCommitFixup", t => {
  gitCommitFixup("123zxc")
  t.true(cpSpawnSpy.calledWith("git", ["commit", "--fixup", "123zxc"], {stdio: "inherit"}))
})

test.serial("should gitCommitAmend", t => {
  gitCommitAmend(["1.js"])
  t.true(cpSpawnSpy.calledWith("git", ["commit", "--amend"], {stdio: "inherit"}))
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
  cpSpawnSpy.onCall(0).returns({on: _ => _, stdout: {on: (_, f) => f("")}, stderr: {on: _ => _}})
  cpSpawnSpy.onCall(1).returns({on: _ => _, stdout: {on: (_, f) => f("some-pager")}, stderr: {on: _ => _}})
  cpSpawnSpy.onCall(2).returns({on: _ => _, stdout: {on: (_, f) => f("delta")}, stderr: {on: _ => _}})

  const pagerSpy = {on: sinon.spy()}
  cpSpawnSpy.onCall(3).returns(pagerSpy)

  const pager1 = await getPager()
  const pager2 = await getPager()
  const pager3 = await getPager()

  t.true(cpSpawnSpy.calledWith("git", ["config", "--get", "core.pager"]))
  t.is(pager1, null)
  t.is(pager2, null)
  t.true(cpSpawnSpy.calledWith("delta", ["--color-only"]))
  t.is(pager3, pagerSpy)
})

test.serial("should gitCheckout", async t => {
  await gitCheckout(["123bc50"])

  t.true(cpSpawnSpy.calledWith("git", ["checkout", "123bc50"], {stdio: "inherit"}))
})

test.serial("should gitAdd", async t => {
  gitAdd(["123"])

  t.true(cpSpawnSpy.calledWith("git", ["add", "123"]))
})

test.serial("should gitReset", async t => {
  gitReset(["123"])

  t.true(cpSpawnSpy.calledWith("git", ["reset", "123"]))
})

test.serial("should gitRebase", async t => {
  await gitRebase(["--interactive", "123bc50"])

  t.true(cpSpawnSpy.calledWith(
    "git",
    ["rebase", "--interactive", "123bc50"],
    {stdio: "inherit"},
  ))
})

test.serial("should gitRoot", async t => {
  gitRoot()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git rev-parse --show-toplevel")
})

test.serial("should isPathRelative", async t => {
  isPathRelative()

  t.deepEqual(cpExecSpy.lastCall.args[0], "git config status.relativePaths")
})
