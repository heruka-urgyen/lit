import path from "path"
import process from "process"
import readline from "readline"
import sliceAnsi from "slice-ansi"
import ansiToJson from "ansi-to-json"

import {
  isPathRelative,
  gitRoot,
  isGitRepo,
  getPager,
  gitDiff,
  gitStatusPorcelain,
} from "git-utils"
import {pipe, renderHint, statusStrToList, calculateListView} from "utils"
import {selectedBackground} from "colors"
import {diffHint} from "hints"

import Selector from "components/Selector"

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
  try {
    await isGitRepo()
  } catch (e) {
    console.log(e)
  }

  const data = await gitStatusPorcelain()

  return statusStrToList(data)
}

export const getComponent = () => import("components/DiffContainer.js").then(x => x.default)

export const getDimensions = () => ({
  minHeight: process.stdout.rows - 6,
  maxHeight: process.stdout.rows - 6,
})

export const getHint = mode => {
  const style = {marginLeft: 1, marginTop: 2, marginBottom: 1}
  const {
    quit, back, toggleAll, showPreview, hidePreview, resize, scrollPreview,
    stage, reset, checkout, commit, amend, fixup,
  } = diffHint

  if (mode === "diff") {
    return renderHint(style)([
      [quit, toggleAll, showPreview, resize],
      [stage, reset, checkout, commit, amend, fixup],
    ])
  }

  if (mode === "preview") {
    return renderHint(style)([
      [quit, hidePreview, scrollPreview],
    ])
  }

  return renderHint(style)([
    [quit, back],
  ])
}

export const showPreview = async (update, f) => {
  const rel = await isPathRelative()
  const root = await gitRoot()
  const file = rel ? f : path.resolve(root, f)
  const status = await gitStatusPorcelain(file)

  status.split("\n").forEach(async f => {
    if (f.length > 0) {
      const [x, y] = f.split(" ")
      const pager = await getPager()

      if (x === "?") {
        pipe(gitDiff(["--no-index", "/dev/null", file]), pager).then(update)
      } else if (y === "M." || y === "A.") {
        pipe(gitDiff(["--staged", file]), pager).then(update)
      } else if (y === ".D") {
        pipe(gitDiff(["HEAD", "--", file]), pager).then(update)
      } else {
        pipe(gitDiff([file]), pager).then(update)
      }
    }
  })
}

const splitToWidth = (limit, str, arr) => {
  const res = sliceAnsi(str, 0, limit)
  const next = sliceAnsi(str, limit)

  if (next.length > 0) {
    return splitToWidth(limit, next, arr.concat([res, "\n"]))
  }

  return arr.concat(res)
}

export const calculatePreviewWindow = (preview, width, height, position) => (
  preview.split("\n")
    .slice(position, position + height - 2)
    .reduce((acc, x) => {
      if (acc.flat().length === height - 2) {
        return acc
      }

      return acc.concat([splitToWidth(width - 2, x, [])])
    }, [])
    .map((xs, i) => (
      xs.flatMap(x => ansiToJson(x)).reduce((acc, x, j) => {
        const id = `${i}${j}`

        if (acc.length === 0) {
          return [{...x, id}]
        }

        const prevEl = [...acc].reverse().find(x => x.content !== "\n")
        const prevChunkHeader = /@@.+@@/.test(prevEl.content)

        return acc.concat([
          {
            ...x,
            id,
            fg: (x.fg || prevChunkHeader) ? x.fg : prevEl.fg,
            bg: (x.bg || x.fg === prevEl.bg) ? x.bg : prevEl.bg,
          }])
      }, [])
    ))
)
