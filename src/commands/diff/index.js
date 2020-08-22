import process from "process"

import React from "react"
import cliCursor from "cli-cursor"
import chalk from "chalk"

import {getData, preRender, getHint, render} from "commands/status/prepare"

(async () => {
  try {
    const {underline: u, bold: b, yellow} = chalk
    cliCursor.hide()

    const data = await getData()

    if (data.length === 0) {
      process.exit()
    }

    const minHeight = process.stdout.rows - 7
    const maxHeight = process.stdout.rows - 7
    const [h1, h2] = getHint().split("\n")
    const hint = [
      h1.split(" | ").concat([
        `${b(u(yellow("v")))} toggle preview`,
        `${b(u(yellow("h")))} ${b(u(yellow("l")))} resize`,
      ]).join(" | "),
      h2,
    ].join("\n")

    preRender(hint)(data)(maxHeight)(minHeight)

    const Layout = await import("./Layout.js").then(x => x.default)

    render(
      <Layout
        initialLines={data}
        minHeight={minHeight}
        maxHeight={maxHeight}
      />,
    )
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
    process.exit()
  }
})()
