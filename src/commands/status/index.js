/* eslint-disable import/prefer-default-export */

import process from "process"
import readline from "readline"

import React from "react"
import cliCursor from "cli-cursor"
import chalk from "chalk"

import Selector from "components/Selector"
import {isGitRepo, gitStatus} from "git-utils"
import {statusStrToList, calculateListView} from "utils"

cliCursor.hide()

export const preRender = lines => {
  const {underline, bold, green, red, blue, yellow} = chalk
  const hint = [
    ` ${underline(bold(green("s")))}tage | `,
    `${underline(bold(red("r")))}eset | `,
    `check${underline(bold(red("o")))}ut | `,
    `${underline(bold(blue("c")))}ommit | `,
    `a${underline(bold(blue("m")))}end | `,
    `${underline(bold(blue("f")))}ixup | `,
    `${underline(bold(yellow("q")))}uit`,
  ].join("")

  const linesToRender = lines.map((el, i) => Selector({isSelected: i === 0, el}))

  process.stdout.write(
    ["", hint, "", ...linesToRender, "", ""].join("\n"),
  )
}

const run = async () => {
  try {
    await isGitRepo()

    const data = await gitStatus()

    if (data.length > 0) {
      const initialLines = statusStrToList(data)
      const {items} = calculateListView(initialLines, process.stdout.rows - 5, 0)
      preRender(items)
      readline.moveCursor(process.stdout, -items[0].length, -items.length - 1)

      const [{render}, Status] = await Promise.all([
        import("ink"),
        import("./View.js").then(x => x.default),
      ])

      render(<Status initialLines={initialLines} />)
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
  }
}

run()
