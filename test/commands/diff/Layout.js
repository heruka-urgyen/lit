import test from "ava"
import React from "react"
import {render} from "ink-testing-library"
import sinon from "sinon"

import * as g from "git-utils"
import Layout from "commands/diff/Layout"
import * as u from "commands/diff/utils"
import * as r from "commands/diff/reducer"

const delay = (n = 0) => new Promise(r => setTimeout(r, n))

let gitStatusPorcelain
let gitDiff

test.beforeEach(() => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  gitDiff = sinon.stub(g, "gitDiff")
})

test.afterEach(() => {
  gitStatusPorcelain.restore()
  gitDiff.restore()
})

test.serial("should update preview on selecting next file", async t => {
  gitStatusPorcelain.onCall(0).resolves("1 .M zbc\n")
  gitDiff.onCall(0).resolves("@@ +0,7 -0,0 @@\n+ preview")

  gitStatusPorcelain.onCall(1).resolves("1 A. xcv\n")
  gitDiff.onCall(1).resolves("@@ +0,8 -0,0 @@\n+ preview2")

  gitStatusPorcelain.onCall(2).resolves("? rty\n")
  gitDiff.onCall(2).resolves("@@ +0,9 -0,0 @@\n+ preview3\n")

  const output = render(
    <Layout
      initialLines={["M zbc", "A xcv", "?? rty"]}
      minHeight={5}
      maxHeight={5}
    />,
  )

  await delay()
  t.truthy(output.lastFrame().indexOf(" ❯ M zbc") > -1)
  t.truthy(output.lastFrame().indexOf("   A xcv") > -1)
  t.truthy(output.lastFrame().indexOf("   ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,7 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview") > -1)

  output.stdin.write("j")
  await delay()
  t.truthy(output.lastFrame().indexOf("   M zbc") > -1)
  t.truthy(output.lastFrame().indexOf(" ❯ A xcv") > -1)
  t.truthy(output.lastFrame().indexOf("   ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,8 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview2") > -1)

  output.stdin.write("j")
  await delay()
  t.truthy(output.lastFrame().indexOf("   M zbc") > -1)
  t.truthy(output.lastFrame().indexOf("   A xcv") > -1)
  t.truthy(output.lastFrame().indexOf(" ❯ ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,9 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview3 ") > -1)
})

test.serial("should show preview and resize preview window", async t => {
  const showPreviewStub = sinon.stub(u, "showPreview")
  const getActionsStub = sinon.stub(r, "getActions")
  const {setWidth} = getActionsStub.returns({
    scrollPreview: sinon.spy(),
    setWidth: sinon.spy(),
  })()

  const output = render(
    <Layout
      initialLines={["M zbc", "A xcv", "?? rty"]}
      minHeight={5}
      maxHeight={5}
    />,
  )
  await delay()
  t.truthy(showPreviewStub.called)
  t.is(setWidth.callCount, 1)

  output.stdin.write("v")
  await delay()
  t.is(setWidth.callCount, 3)

  await delay()
  output.stdin.write("v")
  await delay()
  t.is(setWidth.callCount, 4)
  output.stdin.write("l")
  await delay()
  t.is(setWidth.callCount, 5)
  await delay()
  output.stdin.write("h")
  await delay()
  t.is(setWidth.callCount, 6)

  await delay()
  output.stdin.write("f")
  await delay()
  t.is(setWidth.callCount, 7)

  showPreviewStub.restore()
  getActionsStub.restore()
})

test.serial("should scroll preview", async t => {
  const showPreviewStub = sinon.stub(u, "showPreview")
  const getActionsStub = sinon.stub(r, "getActions")
  const {scrollPreview} = getActionsStub.returns({
    setWidth: sinon.spy(),
    scrollPreview: sinon.spy(),
  })()

  const output = render(
    <Layout
      initialLines={["M zbc", "A xcv", "?? rty"]}
      minHeight={0}
      maxHeight={0}
    />,
  )

  const ARROW_UP = "\u001B[A"
  const ARROW_DOWN = "\u001B[B"

  await delay()
  output.stdin.write("v")
  await delay()
  output.stdin.write("j")
  t.is(scrollPreview.callCount, 1)
  await delay()
  output.stdin.write(ARROW_DOWN)
  t.is(scrollPreview.callCount, 2)
  await delay()
  output.stdin.write("k")
  t.is(scrollPreview.callCount, 3)
  await delay()
  output.stdin.write(ARROW_UP)
  t.is(scrollPreview.callCount, 4)
  await delay()
  output.stdin.write("d")
  t.is(scrollPreview.callCount, 5)
  await delay()
  output.stdin.write("u")
  t.is(scrollPreview.callCount, 6)
  await delay()
  output.stdin.write("g")
  t.is(scrollPreview.callCount, 7)
  await delay()
  output.stdin.write("G")
  t.is(scrollPreview.callCount, 8)

  getActionsStub.restore()
  showPreviewStub.restore()
})
