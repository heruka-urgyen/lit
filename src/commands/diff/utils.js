/* eslint-disable import/prefer-default-export */
import {gitDiff, gitStatusPorcelain} from "git-utils"

export const showPreview = async (update, file) => {
  const status = await gitStatusPorcelain(file)

  status.split("\n").forEach(f => {
    if (f.length > 0) {
      const [x, y] = f.split(" ")

      if (x === "?") {
        gitDiff(["--no-index", "/dev/null", file]).then(update)
      } else if (y === "M." || y === "A.") {
        gitDiff(["--staged", file]).then(update)
      } else {
        gitDiff([file]).then(update)
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
