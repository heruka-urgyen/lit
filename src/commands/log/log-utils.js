import stripAnsi from "strip-ansi"
import {delay, pipe, statusStrToList} from "utils"
import {gitCommittedFiles, getPager, gitShow} from "git-utils"

export const parseCommitHash = str => stripAnsi(str.split(" ")[0])

export const getCommitFiles =
  commit => gitCommittedFiles([parseCommitHash(commit)]).then(statusStrToList)

export const showPreview = commit => async (update, file) => {
  const pager = await getPager()
  pipe(gitShow([parseCommitHash(commit), "--", file]), pager).then(update)
}

export const handleInput = props => async (input, key) => {
  const {
    exit,
    gitCheckout,
    gitRebase,
    commit,
    mode,
    setMode,
    setFiles,
  } = props

  if (input === "q") {
    await delay(0)
    exit()
  }

  if (input === "o") {
    await gitCheckout([parseCommitHash(commit)])
    exit()
  }

  if (input === "r") {
    await gitRebase(["--interactive", parseCommitHash(commit)])
    exit()
  }

  if ((input === "l" || key.return) && mode === "log") {
    setMode("diff")
  }

  if ((input === "b" || key.backspace) && mode === "diff") {
    await delay(0)
    setFiles([])
    setMode("log")
  }
}
