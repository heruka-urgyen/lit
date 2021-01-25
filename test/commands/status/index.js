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

const gs = sinon.stub(g)
let pauseSpy

test.beforeEach(_ => {
  pauseSpy = sinon.spy(p.stdin, "pause")
})

test.afterEach(_ => {
  pauseSpy.restore()
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
