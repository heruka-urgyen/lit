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

test.beforeEach(_ => {
  cpSpawnSpy = sinon.stub(cp, "spawn")

  cpSpawnSpy.returns({on: _ => _, stdout: {on: _ => _}, stderr: {on: _ => _}})
})

test.afterEach(_ => {
  cpSpawnSpy.restore()
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

  t.deepEqual(cpSpawnSpy.lastCall.args[0], "git")
  t.deepEqual(cpSpawnSpy.lastCall.args[1], ["diff", "--cached", "--name-only"])
})

test.serial("should gitLog", async t => {
  gitLog()

  t.deepEqual(cpSpawnSpy.lastCall.args[0], "git")
  t.deepEqual(cpSpawnSpy.lastCall.args[1], [
    "log",
    "--color=always",
    "--format=%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset",
  ])
})

test.serial("should isGitRepo", async t => {
  isGitRepo()

  t.deepEqual(cpSpawnSpy.lastCall.args[0], "git")
  t.deepEqual(cpSpawnSpy.lastCall.args[1], ["rev-parse", "--is-inside-work-tree"])
})

test.serial("should call getPager", async t => {
  cpSpawnSpy.onCall(0)
    .returns({on: (_, f) => f(), stdout: {on: (_, f) => f("")}, stderr: {on: _ => _}})
  cpSpawnSpy.onCall(1)
    .returns({on: (_, f) => f(), stdout: {on: (_, f) => f("some-pager")}, stderr: {on: _ => _}})
  cpSpawnSpy.onCall(2)
    .returns({on: (_, f) => f(), stdout: {on: (_, f) => f("delta")}, stderr: {on: _ => _}})

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

  t.deepEqual(cpSpawnSpy.lastCall.args[0], "git")
  t.deepEqual(cpSpawnSpy.lastCall.args[1], ["rev-parse", "--show-toplevel"])
})

test.serial("should isPathRelative", async t => {
  isPathRelative()

  t.deepEqual(cpSpawnSpy.lastCall.args[0], "git")
  t.deepEqual(cpSpawnSpy.lastCall.args[1], ["config", "status.relativePaths"])
})
