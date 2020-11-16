/* eslint-disable */

import path from "path"
import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import * as u from "utils"
import * as g from "git-utils"
import {
  preRender,
  getData,
  getHint,
  showPreview,
  calculatePreviewWindow,
} from "commands/diff"

let gitStatus
let isGitRepo
let getPager
let gitDiff
let gitStatusPorcelain
let pipe
let update
let file
let diff
let isPathRelativeStub

const delay = (n = 0) => new Promise(r => setTimeout(r, n))
const ARROW_UP = "\u001B[A"
const ARROW_DOWN = "\u001B[B"

test.beforeEach(() => {
  gitStatus = sinon.stub(g, "gitStatus")
  isGitRepo = sinon.stub(g, "isGitRepo")
  getPager = sinon.stub(g, "getPager")
  gitDiff = sinon.stub(g, "gitDiff")
  pipe = sinon.stub(u, "pipe")
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  isPathRelativeStub = sinon.stub(g, "isPathRelative")

  update = sinon.spy()
  file = fc.string()
  diff = `@@ +0,0 -0,0 @@\n${fc.string()}`
})

test.afterEach(() => {
  gitStatus.restore()
  isGitRepo.restore()
  getPager.restore()
  gitDiff.restore()
  pipe.restore()
  gitStatusPorcelain.restore()
  isPathRelativeStub.restore()
})

test.serial("should show preview for new files", async t => {
  gitStatusPorcelain.resolves(`? ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)
  isPathRelativeStub.resolves(true)

  await showPreview(update, file)
  await delay()
  t.true(update.calledWith(diff))
})

test.serial("should show preview for modified staged files", async t => {
  gitStatusPorcelain.resolves(`1 M. ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)
  isPathRelativeStub.resolves(true)

  await showPreview(update, file)
  await delay()
  t.true(update.calledWith(diff))
})

test.serial("should show preview for new staged files", async t => {
  gitStatusPorcelain.resolves(`1 A. ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)
  isPathRelativeStub.resolves(true)

  await showPreview(update, file)
  await delay()
  t.true(update.calledWith(diff))
})

test.serial("should show preview for unstaged files", async t => {
  gitStatusPorcelain.resolves(`1 .M ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)
  isPathRelativeStub.resolves(true)

  await showPreview(update, file)
  await delay()
  t.true(update.calledWith(diff))
})

test.serial("should show preview for deleted files", async t => {
  gitStatusPorcelain.resolves(`1 .D ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)
  isPathRelativeStub.resolves(true)

  await showPreview(update, file)
  await delay()
  t.true(update.calledWith(diff))
})

testProp.serial(
  "should fit diff in the preview window",
  [
    fc.integer(10, 1000).chain(c => fc.tuple(
      fc.base64String(10),
      fc.integer(10, c),
      fc.constant(c),
      fc.nat(c),
    )),
  ],
  async (t, [string, width, height, position]) => {
    const preview = `${string}\n`.repeat(height)
    const res = calculatePreviewWindow(preview, width, height, position)
    const compactRes = res.flat().reduce((xs, s) => xs + s.content, "")

    t.true(res.length <= height)
    t.is(res.flat().filter(x => typeof x.id === "string").length, res.flat().length)
    t.true(compactRes.length <= preview.replace(/\n/g, "").length)
    t.true(compactRes.length <= (height - 2) * (width - 2))
  },
)

test.serial("should render hint", async t => {
  const res1 = [
    "",
    "",
    " q quit  | a toggle all | v show preview | h l resize",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
  ].join("\n")

  const res2 = [
    "",
    "",
    " q quit  | v hide preview | j k scroll preview",
    "",
  ].join("\n")

  const res3 = [
    "",
    "",
    " q quit  | b back to status",
    "",
  ].join("\n")

  t.is(getHint("diff"), res1)
  t.is(getHint("preview"), res2)
  t.is(getHint(), res3)
})

test.serial("should pre-render view", async t => {
  const stdout = sinon.stub(process.stdout)
  const write = sinon.spy()
  stdout.columns = 50
  stdout.write = write

  preRender(getHint("diff"))(["M filename"])(20)(0)

  const res = [
    "",
    "",
    " q quit  | a toggle all | v show preview | h l resize",
    " s stage | r reset | o checkout | c commit | m amend | f fixup",
    "",
    " ❯ M filename",
    "",
    "",
  ].join("\n")

  t.true(write.calledWith(res))
})

test.serial("should get data", async t => {
  const statusStrToList = sinon.stub(u, "statusStrToList")
  gitStatus.resolves("status")

  await getData()

  t.true(isGitRepo.called)
  t.true(gitStatus.called)
  t.true(statusStrToList.calledWith("status"))

  statusStrToList.restore()
})
