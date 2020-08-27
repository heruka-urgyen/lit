/* eslint-disable */

import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import * as u from "utils"
import * as g from "git-utils"
import {
  showPreview,
  calcuateScrollPosition,
  resizePreview,
  calculatePreviewWindow,
} from "commands/diff/utils"

let getPager
let gitDiff
let gitStatusPorcelain
let pipe
let update
let file
let diff

const delay = (n = 0) => new Promise(r => setTimeout(r, n))
const ARROW_UP = "\u001B[A"
const ARROW_DOWN = "\u001B[B"

test.beforeEach(() => {
  getPager = sinon.stub(g, "getPager")
  gitDiff = sinon.stub(g, "gitDiff")
  pipe = sinon.stub(u, "pipe")
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")

  update = sinon.spy()
  file = fc.string()
  diff = `@@ +0,0 -0,0 @@\n${fc.string()}`
})

test.afterEach(() => {
  getPager.restore()
  gitDiff.restore()
  pipe.restore()
  gitStatusPorcelain.restore()
})

test.serial("should show preview for new files", async t => {
  gitStatusPorcelain.resolves(`? ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)

  await showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(diff))
})

test.serial("should show preview for modified staged files", async t => {
  gitStatusPorcelain.resolves(`1 M. ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(diff))
})

test.serial("should show preview for new staged files", async t => {
  gitStatusPorcelain.resolves(`1 A. ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(diff))
})

test.serial("should show preview for unstaged files", async t => {
  gitStatusPorcelain.resolves(`1 .M ${file}\n`)
  gitDiff.resolves(diff)
  getPager.resolves(null)
  pipe.resolves(diff)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(diff))
})

testProp.serial(
  "should scroll preview up and down and stay in preview boundaries",
  [
    fc.integer(1, 10000).chain(c => fc.tuple(
      fc.integer(0, c),
      fc.constant(c),
      fc.nat(),
    )),
    fc.base64(),
  ],
  async (t, [pp, pl, mh], key) => {
    const s = {previewPosition: pp, previewLength: pl, maxHeight: mh}
    const keys = `01Gggjkud${key}`

    keys.split("").forEach(key => {
      const res = calcuateScrollPosition
        (
          key,
          key === 0 ? {downArrow: true} :
          key === 1 ? {upArrow: true} :
          key === "G" ? {shift: true} : {},
        )
        (s)

      t.truthy((res >= 0 && res <= Math.max(pl, pl - mh + 1)) || res === pp)
    })
  },
)

testProp.serial(
  "should resize preview window",
  [fc.integer(5, 95), fc.base64()],
  async (t, w, key) => {
    const keys = `hlf12${key}`

    keys.split("").forEach(key => {
      const res = resizePreview
        (
          key,
          key === "1" ? {rightArrow: true} : key === "2" ? {leftArrow: true} : {},
        )
        (w)

      t.truthy(res === 0 || (res >= 5 && res <= 95))
    })
  },
)

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

    t.truthy(res.length <= height)
    t.is(res.flat().filter(x => typeof x.id === "string").length, res.flat().length)
    t.truthy(compactRes.length <= preview.replace(/\n/g, "").length)
    t.truthy(compactRes.length <= (height - 2) * (width - 2))
  },
)
