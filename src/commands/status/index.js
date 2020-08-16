/* eslint-disable import/prefer-default-export */

import process from "process"
import readline from "readline"

import React from "react"
import cliCursor from "cli-cursor"
import chalk from "chalk"

import Selector from "components/Selector"
import {gitStatus} from "git-utils"
import {statusStrToList} from "utils"

cliCursor.hide()

export const preRender = lines => {
  const {underline, bold, green, red, blue, yellow} = chalk
  const hint = [
    ` ${underline(bold(green("s")))}tage | `,
    `${underline(bold(red("r")))}eset | `,
    `check${underline(bold(red("o")))}ut | `,
    `${underline(bold(blue("c")))}ommit | `,
    `${underline(bold(blue("a")))}mend | `,
    `${underline(bold(blue("f")))}ixup | `,
    `${underline(bold(yellow("q")))}uit`,
  ].join("")

  const linesToRender = lines.map((el, i) => Selector({isSelected: i === 0, el}))

  process.stdout.write(
    ["", hint, "", ...linesToRender, "", ""].join("\n"),
  )
}

gitStatus().on("data", async data => {
  const initialLines = statusStrToList(data)
  preRender(initialLines)

  readline.moveCursor(process.stdout, -initialLines[0].length, -initialLines.length - 1)

  const [{render}, Status] = await Promise.all([
    import("ink"),
    import("./View.js").then(x => x.default),
  ])

  render(<Status initialLines={initialLines} />)
})
