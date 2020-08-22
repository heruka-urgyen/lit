import test from "ava"

import reducer, {handlers, getActions} from "commands/diff/reducer"

test("exports reducer", t => {
  t.truthy(typeof reducer === "function")
})

test("setWidth", t => {
  const s = {width: 50}

  t.deepEqual(handlers.setWidth(s, {payload: w => w + 10}), {width: 60})
})

test("setPreview", t => {
  const s = {preview: ""}

  t.deepEqual(
    handlers.setPreview(s, {payload: "abc\n@@ 123 @@\nabc\n"}),
    {preview: "@@ 123 @@\nabc\n", previewPosition: 0},
  )
})

test("scrollPreview", t => {
  const s = {previewPosition: 0}

  t.deepEqual(handlers.scrollPreview(s, {payload: p => p + 1}), {previewPosition: 1})
})

test("toggleMode preview -> normal", t => {
  const s = {
    width: 95,
    mode: {
      type: "preview",
      previousWidth: 50,
      currentWidth: 95,
    },
  }

  t.deepEqual(
    handlers.toggleMode(s),
    {
      width: 95,
      mode: {
        type: "normal",
        previousWidth: 95,
        currentWidth: 50,
      },
    },
  )
})

test("toggleMode normal -> preview", t => {
  const s = {
    width: 50,
    mode: {
      type: "normal",
      previousWidth: 95,
      currentWidth: 50,
    },
  }

  t.deepEqual(
    handlers.toggleMode(s),
    {
      width: 50,
      mode: {
        type: "preview",
        previousWidth: 50,
        currentWidth: 95,
      },
    },
  )
})

test("reducer actions", t => {
  const actions = getActions(_ => _)
  const {
    setWidth,
    setPreview,
    toggleMode,
    scrollPreview,
  } = actions

  t.truthy(typeof setWidth === "function")
  t.truthy(typeof setPreview === "function")
  t.truthy(typeof toggleMode === "function")
  t.truthy(typeof scrollPreview === "function")
})
