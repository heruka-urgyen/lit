import process from "process"

import React from "react"
import cliCursor from "cli-cursor"

import {renderHint} from "utils"
import {diffHint as df} from "hints"
import {getData, preRender} from "commands/status/prepare"

import {showPreview} from "./utils"

(async () => {
  try {
    cliCursor.hide()

    const data = await getData()

    if (data.length === 0) {
      process.exit()
    }

    const minHeight = process.stdout.rows - 6
    const maxHeight = process.stdout.rows - 6

    const style = {marginLeft: 1, marginTop: 1, marginBottom: 1}
    const {
      quit, toggleAll, togglePreview, resize,
      stage, reset, checkout, commit, amend, fixup,
    } = df

    const hint = renderHint(style)([
      [quit, toggleAll, togglePreview, resize],
      [stage, reset, checkout, commit, amend, fixup],
    ])

    preRender(hint)(data)(maxHeight)(minHeight)

    const Layout = await import("./Layout.js").then(x => x.default)
    const {render, Box, Text} = await import("ink")

    render(
      <Box flexDirection="column">
        <Text>{hint}</Text>
        <Layout
          initialLines={data}
          minHeight={minHeight}
          maxHeight={maxHeight}
          showPreview={showPreview}
        />
      </Box>,
    )
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
    process.exit()
  }
})()
