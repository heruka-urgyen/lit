import test from "ava"
import React from "react"
import {render} from "ink-testing-library"

import Selectable from "components/Selectable"

test("selected", t => {
  const data = ["M file1", "A file2", "?? file3"]
  const r = render(<Selectable data={data} selected={1} maxHeight={10} />)

  t.deepEqual(
    r.lastFrame(), [
      "   M file1",
      " ❯ A file2",
      "   ?? file3",
    ].join("\n"),
  )
})
