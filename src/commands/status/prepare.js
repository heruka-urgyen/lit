/* eslint-disable import/prefer-default-export */

import process from "process"
import readline from "readline"
import chalk from "chalk"

import Selector from "components/Selector"
import {isGitRepo, gitStatus} from "git-utils"
import {statusStrToList, calculateListView} from "utils"

export const getHint = () => {
  const {underline: u, bold: b, green, red, blue, yellow} = chalk
  const hint1 = [
    ` ${u(b(yellow("q")))} quit `,
    `${u(b(yellow("a")))} toggle all`,
  ].join(" | ")

  const hint2 = [
    ` ${u(b(green("s")))} stage`,
    `${u(b(red("r")))} reset`,
    `${u(b(red("o")))} checkout`,
    `${u(b(blue("c")))} commit`,
    `${u(b(blue("m")))} amend`,
    `${u(b(blue("f")))} fixup`,
  ].join(" | ")

  return [hint1, hint2].join("\n")
}

export const preRender = hint => lines => viewHeight => {
  const {items} = calculateListView(lines, viewHeight, 0)
  const linesToRender = items.map((el, i) => Selector({isSelected: i === 0, el}))

  process.stdout.write(
    ["", hint, "", ...linesToRender, "", ""].join("\n"),
  )

  readline.moveCursor(process.stdout, -items[0].length, -(items.length + spaces.length + 2))
}

export const getData = async () => {
  await isGitRepo()
  const data = await gitStatus()

  return statusStrToList(data)
}

export const getComponent = () => import("./View.js").then(x => x.default)

export const render = async component => {
  const {render} = await import("ink")

  render(component)
}
