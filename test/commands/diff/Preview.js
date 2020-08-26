import test from "ava"
import React from "react"
import {render} from "ink-testing-library"

import Preview, {calculatePreviewWindow} from "commands/diff/Preview"

test("should render Preview", t => {
  const output = render(
    <Preview
      preview={"abc\nasdf\n123"}
      width={50}
      height={50}
      previewPosition={0}
    />,
  )

  const res = [
    "abc",
    "asdf",
    "123",
  ].join("\n")

  t.deepEqual(output.lastFrame(), res)
})

test("should calculate preview size", t => {
  const preview = ["qwertyuiop", "asdf", "zxc"]

  const output1 = calculatePreviewWindow(preview, 6, 4, 0)
  const res1 = ["qwertyuiop"]
  const output2 = calculatePreviewWindow(preview, 6, 5, 0)
  const res2 = ["qwertyuiop", "asdf"]

  t.deepEqual(output1, res1)
  t.deepEqual(output2, res2)
})
