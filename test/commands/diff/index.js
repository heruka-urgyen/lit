/* eslint-disable */

import path from "path"
import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import * as u from "utils"
import * as g from "git-utils"
import {
  showPreview,
  calculatePreviewWindow,
} from "commands/diff"

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
