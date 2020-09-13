import test from "ava"
import React from "react"
import {render} from "ink-testing-library"

import Preview from "components/Preview"

test("should render Preview", t => {
  const output = render(
    <Preview
      preview={"abc\nasdf\n123\n"}
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
