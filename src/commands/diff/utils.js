import sliceAnsi from "slice-ansi"
import ansiToJson from "ansi-to-json"

import {getPager, gitDiff, gitStatusPorcelain} from "git-utils"
import {pipe} from "utils"

export const showPreview = async (update, file) => {
  const status = await gitStatusPorcelain(file)

  status.split("\n").forEach(async f => {
    if (f.length > 0) {
      const [x, y] = f.split(" ")
      const pager = await getPager()

      if (x === "?") {
        pipe(gitDiff(["--no-index", "/dev/null", file]), pager).then(update)
      } else if (y === "M." || y === "A.") {
        pipe(gitDiff(["--staged", file]), pager).then(update)
      } else {
        pipe(gitDiff([file]), pager).then(update)
      }
    }
  })
}

let t
let timesPressed = 0
const press = n => {
  clearTimeout(t)
  t = setTimeout(() => press(0), 500)
  timesPressed = n
}

export const calcuateScrollPosition = (input, key) => state => {
  const {previewPosition, previewLength, maxHeight} = state

  if (input === "j" || key.downArrow) {
    return Math.max(0, Math.min(previewPosition + 1, previewLength - maxHeight + 1))
  }

  if (input === "k" || key.upArrow) {
    return Math.max(0, previewPosition - 1)
  }

  if (input === "d") {
    return Math.max(
      0,
      Math.min(previewPosition + maxHeight / 2, previewLength - maxHeight + 1),
    )
  }

  if (input === "u") {
    return Math.max(0, previewPosition - maxHeight / 2)
  }

  if (input === "G" && key.shift) {
    return Math.max(0, previewLength - maxHeight + 1)
  }

  if (input === "g") {
    const p = timesPressed + 1
    press(p)

    if (p > 1) {
      return 0
    }
  }

  return previewPosition
}

export const resizePreview = (input, key) => w => {
  if (input === "l" || key.rightArrow) {
    return Math.max(5, w - 10)
  }

  if (input === "h" || key.leftArrow) {
    return Math.min(95, w + 10)
  }

  if (input === "f") {
    return 0
  }

  return w
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
