import React from "react"
import test from "ava"
import {render} from "ink-testing-library"
import sinon from "sinon"

import Status from "components/Status"
import * as g from "git-utils"

let gitStatus
let gitHasStagedFiles
let gitLog

test.beforeEach(_ => {
  gitStatus = sinon.stub(g, "gitStatus")
  gitHasStagedFiles = sinon.stub(g, "gitHasStagedFiles")
  gitLog = sinon.stub(g, "gitLog")
})

test.afterEach(_ => {
  gitStatus.restore()
  gitHasStagedFiles.restore()
  gitLog.restore()
})

test.serial("should render status view", t => {
  const initialLines = [
    "M filename",
    "A filename2",
    "?? filename3",
  ]

  const actions = {
    setMode: sinon.spy(),
    selectItem: sinon.spy(),
    selectLogItem: sinon.spy(),
    toggleSelectAll: sinon.spy(),
    setLog: sinon.spy(),
    setFiles: sinon.spy(),
  }

  const state1 = {
    app: {
      mode: "status",
    },
    status: {
      selected: 0,
      allSelected: false,
      files: initialLines,
    },
    log: {
      data: [],
      selected: 0,
    },
  }

  const state2 = {
    app: {
      mode: "preview",
    },
    status: {
      selected: 0,
      allSelected: false,
      files: initialLines,
    },
    log: {
      data: [],
      selected: 0,
    },
  }

  const state3 = {
    app: {
      mode: "diff",
    },
    status: {
      selected: 0,
      allSelected: false,
      files: initialLines,
    },
    log: {
      data: [],
      selected: 0,
    },
  }

  const output1 = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={actions}
      state={state1}
    />,
  )

  const output2 = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={actions}
      state={state2}
    />,
  )

  const output3 = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={actions}
      state={state3}
    />,
  )

  const res = [
    " ❯ M filename",
    "   A filename2",
    "   ?? filename3",
  ].join("\n")

  t.deepEqual(output1.lastFrame(), res)
  t.deepEqual(output2.lastFrame(), res)
  t.deepEqual(output3.lastFrame(), res)
})

test.serial("should render fixup view", t => {
  const commit = "123zxc45 - message (5 days ago) <author>"
  const actions = {
    setMode: sinon.spy(),
    selectItem: sinon.spy(),
    selectLogItem: sinon.spy(),
    toggleSelectAll: sinon.spy(),
    setLog: sinon.spy(),
    setFiles: sinon.spy(),
  }

  const state = {
    app: {
      mode: "fixup",
    },
    status: {
      selected: 0,
      allSelected: false,
      files: [],
    },
    log: {
      data: [commit],
      selected: 0,
    },
  }

  const output = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={actions}
      state={state}
    />,
  )

  const res = ` ❯ ${commit}`

  t.deepEqual(output.lastFrame(), res)
})

test.serial("should not render when mode has wrong value", t => {
  const commit = "123zxc45 - message (5 days ago) <author>"
  const actions = {
    setMode: sinon.spy(),
    selectItem: sinon.spy(),
    selectLogItem: sinon.spy(),
    toggleSelectAll: sinon.spy(),
    setLog: sinon.spy(),
    setFiles: sinon.spy(),
  }

  const state = {
    app: {
      mode: "",
    },
    status: {
      selected: 0,
      allSelected: false,
      files: [],
    },
    log: {
      data: [commit],
      selected: 0,
    },
  }

  const output = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={actions}
      state={state}
    />,
  )

  const res = ""

  t.deepEqual(output.lastFrame(), res)
})
