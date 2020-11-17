import process from "process"
import readline from "readline"
import sliceAnsi from "slice-ansi"
import {statusStrToList, renderHint, calculateListView} from "utils"
import {
  gitStatus,
  isGitRepo,
} from "git-utils"
import {selectedBackground} from "colors"
import {statusHint as sh} from "hints"

import Selector from "components/Selector"

export const getDimensions = () => ({
  minHeight: 0,
  maxHeight: process.stdout.rows - 6,
})

export const getHint = (mode = "status") => {
  const style = {marginLeft: 1, marginTop: 1, marginBottom: 1}
  const {quit, back, toggleAll, stage, reset, checkout, commit, amend, fixup} = sh

  if (mode === "log") {
    return renderHint(style)([
      [quit, back],
    ])
  }

  return renderHint(style)([
    [quit, toggleAll],
    [stage, reset, checkout, commit, amend, fixup],
  ])
}

export const preRender = hint => lines => maxHeight => minHeight => {
  const {items} = calculateListView(lines, maxHeight, 0)
  const linesToRender = items
    .map((el, i) => Selector({isSelected: i === 0, backgroundColor: selectedBackground, el}))
    .map(el => sliceAnsi(el, 0, process.stdout.columns - 1))

  const view = [hint, ...linesToRender, ""]
  const spaces = "\n".repeat(Math.max(0, 1 + minHeight - view.length))

  process.stdout.write([...view, spaces].join("\n"))
  readline.moveCursor(process.stdout, -items[0].length, -(view.length + spaces.length + 3))
}

export const getData = async () => {
  await isGitRepo()
  const data = await gitStatus()

  return statusStrToList(data)
}

export const getComponent = () => import("components/Status.js").then(x => x.default)
