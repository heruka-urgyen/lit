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
