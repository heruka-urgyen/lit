import React from "react"
import test from "ava"
import {render} from "ink-testing-library"
import sinon from "sinon"

import Status from "commands/status/View"
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

test.serial("should render view", t => {
  const initialLines = [
    "M filename",
    "A filename2",
    "?? filename3",
  ]

  const output = render(
    <Status
      minHeight={0}
      maxHeight={20}
      actions={{}}
      state={{
        app: {
          mode: "status",
        },
        status: {
          selected: 0,
          allSelected: false,
          log: [],
          files: initialLines,
        },
      }}
    />,
  )

  const res = [
    " ❯ M filename",
    "   A filename2",
    "   ?? filename3",
  ].join("\n")

  t.deepEqual(output.lastFrame(), res)
})
