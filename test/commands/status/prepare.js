import test from "ava"
import {stdout} from "test-console"
import stripAnsi from "strip-ansi"
import sinon from "sinon"

import {getHint, preRender, getData} from "commands/status/prepare"
import * as g from "git-utils"
import * as u from "utils"

test("should return hint", async t => {
  const hint = getHint()

  const res = [
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
  ].join("\n")

  t.deepEqual(hint, res)
})

test("should pre-render view", async t => {
  const output = stdout.inspectSync(() => {
    preRender(getHint())(["M filename"])(20)(0)
  })

  const res = [
    "",
    " q quit  | a toggle all",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
    " ❯ M filename",
    "",
    "",
  ].join("\n")

  t.deepEqual(stripAnsi(output[0]), res)
})

test("should get data", async t => {
  const gitStatus = sinon.stub(g, "gitStatus")
  const isGitRepo = sinon.stub(g, "isGitRepo")
  const statusStrToList = sinon.stub(u, "statusStrToList")

  gitStatus.resolves("status")

  await getData()

  t.truthy(isGitRepo.called)
  t.truthy(gitStatus.called)
  t.truthy(statusStrToList.calledWith("status"))

  gitStatus.restore()
  isGitRepo.restore()
  statusStrToList.restore()
})
