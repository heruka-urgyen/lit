import process from "process"

import React from "react"
import cliCursor from "cli-cursor"

import {getData, preRender} from "commands/status/prepare"
import {getHint} from "./prepare"

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

    preRender(getHint("status"))(data)(maxHeight)(minHeight)

    const Layout = await import("./Layout.js").then(x => x.default)
    const {render} = await import("ink")

    const App = () => (
      <Layout
        initialLines={data}
        minHeight={minHeight}
        maxHeight={maxHeight}
        showPreview={showPreview}
        getHint={getHint}
      />
    )

    render(<App />)
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
    process.exit()
  }
})()
