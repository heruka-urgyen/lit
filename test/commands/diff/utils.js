/* eslint-disable */

import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import * as g from "git-utils"
import {showPreview, calcuateScrollPosition, resizePreview} from "commands/diff/utils"

let gitStatusPorcelain
let gitDiff
let update
let file
let diff

const delay = (n = 0) => new Promise(r => setTimeout(r, n))
const ARROW_UP = "\u001B[A"
const ARROW_DOWN = "\u001B[B"

test.beforeEach(() => {
  update = sinon.spy()
  file = fc.string()
  diff = fc.string()
})

test.serial("should show preview for new files", async t => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  gitDiff = sinon.stub(g, "gitDiff")

  gitStatusPorcelain.resolves(`? ${file}\n`)
  gitDiff.resolves(`@@ +0,0 -0,0 @@\n${diff}`)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(`@@ +0,0 -0,0 @@\n${diff}`))

  gitStatusPorcelain.restore()
  gitDiff.restore()
})

test.serial("should show preview for modified staged files", async t => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  gitDiff = sinon.stub(g, "gitDiff")

  gitStatusPorcelain.resolves(`1 M. ${file}\n`)
  gitDiff.resolves(`@@ +0,0 -0,0 @@\n${diff}`)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(`@@ +0,0 -0,0 @@\n${diff}`))

  gitStatusPorcelain.restore()
  gitDiff.restore()
})

test.serial("should show preview for new staged files", async t => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  gitDiff = sinon.stub(g, "gitDiff")

  gitStatusPorcelain.resolves(`1 A. ${file}\n`)
  gitDiff.resolves(`@@ +0,0 -0,0 @@\n${diff}`)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(`@@ +0,0 -0,0 @@\n${diff}`))

  gitStatusPorcelain.restore()
  gitDiff.restore()
})

test.serial("should show preview for unstaged files", async t => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  gitDiff = sinon.stub(g, "gitDiff")

  gitStatusPorcelain.resolves(`1 .M ${file}\n`)
  gitDiff.resolves(`@@ +0,0 -0,0 @@\n${diff}`)

  showPreview(update, file)
  await delay()
  t.truthy(update.calledWith(`@@ +0,0 -0,0 @@\n${diff}`))

  gitStatusPorcelain.restore()
  gitDiff.restore()
})

testProp(
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

testProp(
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
