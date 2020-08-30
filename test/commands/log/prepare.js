import test from "ava"
import sinon from "sinon"

import {getHint, preRender, getData} from "commands/log/prepare"
import * as g from "git-utils"

test("should return hint", async t => {
  const hint = getHint()

  const res = [
    " q quit",
    " o checkout",
  ].join("\n")

  t.deepEqual(hint, res)
})

test("should pre-render view", async t => {
  const stdout = sinon.stub(process.stdout)
  const write = sinon.spy()
  stdout.columns = 50
  stdout.write = write

  preRender(getHint())(["123fab0 - commit msg (2 hours ago) <author>"])(20)(0)

  const res = [
    "",
    " q quit",
    " o checkout",
    "",
    " ❯ 123fab0 - commit msg (2 hours ago) <author>",
    "",
    "",
  ].join("\n")

  t.truthy(write.calledWith(res))
})

test("should get data", async t => {
  const gitLog = sinon.stub(g, "gitLog")
  const isGitRepo = sinon.stub(g, "isGitRepo")

  gitLog.resolves("123fab0 - commit msg (2 hours ago) <author>\n")

  await getData()

  t.truthy(isGitRepo.called)
  t.truthy(gitLog.called)

  gitLog.restore()
  isGitRepo.restore()
})
