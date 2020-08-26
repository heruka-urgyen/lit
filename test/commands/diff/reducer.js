import {testProp, fc} from "ava-fast-check"

import {handlers} from "commands/diff/reducer"

testProp("should set width", [fc.integer(), fc.integer()], (t, w1, w2) => {
  const res1 = handlers.setWidth({width: w1}, {payload: w => w + w2})
  const res2 = handlers.setWidth({width: w1}, {payload: w => w - w2})
  const res3 = handlers.setWidth({width: w1}, {payload: _ => w2})

  t.is(res1.width, w1 + w2)
  t.is(res2.width, w1 - w2)
  t.is(res3.width, w2)
})

testProp("should set preview", [fc.string(), fc.string()], (t, p1, p2) => {
  const res = handlers.setPreview({preview: p1}, {payload: p2})

  t.is(res.preview, p2)
})

testProp(
  "should scroll preview",
  [fc.integer(), fc.integer(), fc.string()],
  (t, p1, p2, pr) => {
    const res1 = handlers.scrollPreview(
      {previewPosition: p1, preview: pr},
      {payload: ({previewPosition}) => previewPosition + p2},
    )

    const res2 = handlers.scrollPreview(
      {previewPosition: p1, preview: pr},
      {payload: ({previewPosition}) => previewPosition - p2},
    )

    const res3 = handlers.scrollPreview(
      {previewPosition: p1, preview: pr},
      {payload: _ => p2},
    )

    t.is(res1.previewPosition, p1 + p2)
    t.is(res2.previewPosition, p1 - p2)
    t.is(res3.previewPosition, p2)
  },
)
