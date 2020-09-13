import process from "process"
import readline from "readline"
import sliceAnsi from "slice-ansi"
import stripAnsi from "strip-ansi"
import {statusStrToList, delay, renderHint, calculateListView} from "utils"
import {
  runCmd,
  gitStatus,
  gitHasStagedFiles,
  gitCommit,
  gitCommitAmend,
  gitCommitFixup,
  gitLog,
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

export const getComponent = () => import("./View.js").then(x => x.default)

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

export const handleInput = props => async (input, key) => {
  const {
    exit,
    mode,
    selectItem,
    setMode,
    files,
    setFiles,
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
    await delay(0)
    exit()
  }

  if (mode === "status" || mode === "diff") {
    if (input === "a") {
      toggleSelectAll()
    }

    if (input === "s") {
      if (allSelected) {
        runCommand("add", files, setFiles)
      } else {
        runCommand("add", [files[selected]], setFiles)
      }
    }

    if (input === "r") {
      if (allSelected) {
        runCommand("reset", files, setFiles)
      } else {
        runCommand("reset", [files[selected]], setFiles)
      }
    }

    if (input === "o") {
      let res

      if (allSelected) {
        res = await runCommand("checkout", files, setFiles)
      } else {
        res = await runCommand("checkout", [files[selected]], setFiles)
      }

      const filesChanged = res.join() !== files.join()

      if (filesChanged) {
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

    if (input === "b") {
      setMode("status")
    }
  }
}
