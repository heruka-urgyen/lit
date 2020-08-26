import stripAnsi from "strip-ansi"
import {statusStrToList} from "utils"
import {
  runCmd,
  gitStatus,
  gitHasStagedFiles,
  gitCommit,
  gitCommitAmend,
  gitCommitFixup,
  gitLog,
} from "git-utils"

export const runCommand = async (cmd, fs, update) => {
  const files = fs.map(f => f.split(" ").slice(-1)[0].replace("\r", ""))

  await runCmd({params: [cmd, ...files]})
  const data = await gitStatus()
  const preparedData = statusStrToList(data)
  update(preparedData)

  return preparedData
}

export const commit = async exit => {
  const hasStagedFiles = await gitHasStagedFiles()

  if (hasStagedFiles) {
    process.stdin.pause()
    await gitCommit()
    exit()
  }
}

export const commitFixup = async (commit, exit) => {
  const hash = stripAnsi(commit).match(/[^\s]+/)[0]

  process.stdin.pause()
  await gitCommitFixup(hash)
  exit()
}

export const commitAmend = async exit => {
  const hasStagedFiles = await gitHasStagedFiles()

  if (hasStagedFiles) {
    process.stdin.pause()
    await gitCommitAmend()
    exit()
  }
}

export const updateLog = async update => {
  const output = await gitLog()
  update(output.split("\n").slice(0, -1))
}

const selectDown = items => i => (i + 1) % items.length
const selectUp = items => i => i > 0 ? i - 1 : items.length - 1

export const handleInput = props => async (input, key) => {
  const {
    exit,
    mode,
    selectItem,
    setMode,
    lines,
    setLines,
    selected,
    log,
    setLog,
    allSelected,
    toggleSelectAll,
    runCommand,
    commit,
    commitAmend,
    commitFixup,
    updateLog,
  } = props

  if (input === "q") {
    exit()
  }

  if (mode === "status") {
    if (input === "j" || key.downArrow) {
      selectItem(selectDown(lines))
    }

    if (input === "k" || key.upArrow) {
      selectItem(selectUp(lines))
    }

    if (input === "a") {
      toggleSelectAll()
    }

    if (input === "s") {
      if (allSelected) {
        runCommand("add", lines, setLines)
      } else {
        runCommand("add", [lines[selected]], setLines)
      }
    }

    if (input === "r") {
      if (allSelected) {
        runCommand("reset", lines, setLines)
      } else {
        runCommand("reset", [lines[selected]], setLines)
      }
    }

    if (input === "o") {
      let res

      if (allSelected) {
        res = await runCommand("checkout", lines, setLines)
      } else {
        res = await runCommand("checkout", [lines[selected]], setLines)
      }

      const linesChanged = res.join() !== lines.join()

      if (linesChanged) {
        if (allSelected || res.length === 0) {
          exit()
        } else {
          selectItem(s => Math.min(s, res.length - 1))
        }
      }
    }

    if (input === "c") {
      commit(exit)
    }

    if (input === "m") {
      commitAmend(exit)
    }

    if (input === "f") {
      const hasStagedFiles = await gitHasStagedFiles()

      if (hasStagedFiles) {
        updateLog(setLog)
        setMode("log")
        selectItem(() => 0)
      }
    }
  }

  if (mode === "log") {
    if (key.return) {
      commitFixup(log[selected], exit)
    }

    if (input === "j" || key.downArrow) {
      selectItem(selectDown(log))
    }

    if (input === "k" || key.upArrow) {
      selectItem(selectUp(log))
    }
  }
}
