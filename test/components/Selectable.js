import test from "ava"
import React from "react"
import {render} from "ink-testing-library"
import sinon from "sinon"

import Selectable from "components/Selectable"

const delay = (n = 100) => new Promise(r => setTimeout(r, n))

test("should display selected file", t => {
  const data = ["M file1", "A file2", "?? file3"]
  const r = render(<Selectable data={data} selected={1} minHeight={3} maxHeight={10} />)

  t.deepEqual(
    r.lastFrame(), [
      "   M file1",
      " ❯ A file2",
      "   ?? file3",
    ].join("\n"),
  )
})

test("should select items in status on j, k, g, G", async t => {
  const selectItem = sinon.spy()
  const ARROW_UP = "\u001B[A"
  const ARROW_DOWN = "\u001B[B"

  const data = ["M file1", "A file2", "?? file3"]
  const output = render(
    <Selectable
      data={data}
      selected={0}
      minHeight={10}
      maxHeight={10}
      selectItem={selectItem}
    />,
  )

  await delay()
  output.stdin.write("j")
  await delay()
  t.is(selectItem.callCount, 1)

  output.stdin.write("k")
  await delay()
  t.is(selectItem.callCount, 2)

  output.stdin.write("g")
  await delay()
  output.stdin.write("g")
  await delay()
  t.is(selectItem.callCount, 3)

  output.stdin.write("G")
  await delay()
  t.is(selectItem.callCount, 4)

  output.stdin.write(ARROW_DOWN)
  await delay()
  t.is(selectItem.callCount, 5)

  output.stdin.write(ARROW_UP)
  await delay()
  t.is(selectItem.callCount, 6)
})
