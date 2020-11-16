import test from "ava"
import React from "react"
import {render} from "ink-testing-library"
import sinon from "sinon"

import * as us from "utils"
import * as g from "git-utils"
import DiffContainer from "components/DiffContainer"
import * as u from "commands/diff"

const delay = (n = 0) => new Promise(r => setTimeout(r, n))

let gitStatusPorcelain
let pipe
let getPager
let gitDiff

test.beforeEach(() => {
  gitStatusPorcelain = sinon.stub(g, "gitStatusPorcelain")
  getPager = sinon.stub(g, "getPager")
  gitDiff = sinon.stub(g, "gitDiff")
  pipe = sinon.stub(us, "pipe")
})

test.afterEach(() => {
  gitStatusPorcelain.restore()
  pipe.restore()
  getPager.restore()
  gitDiff.restore()
})

test.serial("should update preview on selecting next file", async t => {
  gitStatusPorcelain.onCall(0).resolves("1 .M zbc\n")
  getPager.resolves(null)
  gitDiff.resolves("")
  pipe.onCall(0).resolves("@@ +0,7 -0,0 @@\n+ preview\n")

  gitStatusPorcelain.onCall(1).resolves("1 A. xcv\n")
  pipe.onCall(1).resolves("@@ +0,8 -0,0 @@\n+ preview2\n")

  gitStatusPorcelain.onCall(2).resolves("? rty\n")
  pipe.onCall(2).resolves("@@ +0,9 -0,0 @@\n+ preview3\n")

  const state = {
    app: {mode: "diff"},
    status: {
      files: ["M zbc", "A xcv", "?? rty"],
      selected: 0,
      allSelected: false,
    },
    diff: {
      width: 0,
      preview: "",
      previewPosition: 0,
      previewWidth: 95,
    },
    log: {
      data: [],
      selected: 0,
    },
  }

  const actions = {
    setMode: sinon.spy(),
    setWidth: sinon.spy(),
    setPreview: sinon.spy(),
    scrollPreview: sinon.spy(),
    selectItem: sinon.spy(),
    toggleSelectAll: sinon.spy(),
    setLog: sinon.spy(),
    setFiles: sinon.spy(),
  }

  const output = render(
    <DiffContainer
      state={state}
      actions={actions}
      minHeight={10}
      maxHeight={10}
      showPreview={u.showPreview}
    />,
  )

  await delay()
  t.true(output.lastFrame().indexOf(" ❯ M zbc") > -1)
  t.true(output.lastFrame().indexOf("   A xcv") > -1)
  t.true(output.lastFrame().indexOf("   ?? rty") > -1)
  await delay(500)
  t.true(actions.setPreview.calledWith("@@ +0,7 -0,0 @@\n+ preview\n"))
  t.is(actions.setWidth.callCount, 1)
})
