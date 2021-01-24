import path from "path"
import process from "process"
import readline from "readline"
import sliceAnsi from "slice-ansi"

import {
  calculateListView,
  colorizeStatus,
  parseCommitHash,
  pipe,
  renderHint,
} from "utils"

import {
  gitCommittedFiles,
  gitLog,
  getPager,
  gitRoot,
  gitShow,
  isGitRepo,
} from "git-utils"

import {selectedBackground} from "colors"
import {logHint as lh, diffHint as dh} from "hints"

import Selector from "components/Selector"

export const getDimensions = () => ({
  minHeight: process.stdout.rows - 7,
  maxHeight: process.stdout.rows - 7,
})

export const getData = async () => {
  await isGitRepo()
  const data = await gitLog()

  return data.split("\n").slice(0, -1)
}

export const getHint = (mode) => {
  const style = {marginLeft: 1, marginTop: 1, marginBottom: 1}
  const {quit, commitDiff, backToLog, checkout, rebase} = lh
  const {showPreview, hidePreview, scrollPreview, resize} = dh

  if (mode === "diff") {
    return renderHint(style)([
      [quit, backToLog],
      [showPreview, resize],
    ])
  }

  if (mode === "preview") {
    return renderHint(style)([
      [quit, hidePreview, scrollPreview],
    ])
  }

  return renderHint(style)([
    [quit, commitDiff],
    [checkout, rebase],
  ])
}

export const preRender = hint => lines => maxHeight => minHeight => {
  const {items} = calculateListView(lines, maxHeight, 0)
  const linesToRender = items
    .map((el, i) => Selector({isSelected: i === 0, backgroundColor: selectedBackground, el}))
    .map(el => sliceAnsi(el, 0, process.stdout.columns - 1))

  const view = [hint, ...linesToRender, ""]
  const spaces = "\n".repeat(Math.max(0, 1 + minHeight - view.length))

  process.stdout.write(
    [...view, spaces].join("\n"),
  )

  readline.moveCursor(process.stdout, -items[0].length, -(view.length + spaces.length + 3))
}

export const getComponent = () => import("components/LogContainer.js").then(x => x.default)

export const getCommitFiles =
  commit => gitCommittedFiles([parseCommitHash(commit)])
    .then(x => x
      .replace(/M\t/g, ".M ")
      .replace(/D\t/g, ".D ")
      .replace(/A\t/g, "A. ")
      .replace(/R.*\t(.+)\t(.+)/g, (_, x, y) => `R. ${y} -> ${x}`))
    .then(xs => xs.split("\n").slice(0, -1).map(x => colorizeStatus(x)))

export const showPreview = commit => async (update, f) => {
  const root = await gitRoot()
  const pager = await getPager()
  const file = path.resolve(root, f)

  pipe(gitShow([parseCommitHash(commit), "--", file]), pager).then(update)
}
