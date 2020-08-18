import React, {useState} from "react"
import {Box, useApp, useInput} from "ink"
import useStdoutDimensions from "ink-use-stdout-dimensions"

import Selectable from "components/Selectable"
import {gitHasStagedFiles} from "git-utils"
import {runCommand, commit, commitAmend, commitFixup, updateLog} from "./utils"

const selectDown = items => i => (i + 1) % items.length
const selectUp = items => i => i > 0 ? i - 1 : items.length - 1

const getInputConfig = props => async (input, key) => {
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
  } = props

  if (input === "q") {
    exit()
  }

  if (mode === "add") {
    if (input === "j" || key.downArrow) {
      selectItem(selectDown(lines))
    }

    if (input === "k" || key.upArrow) {
      selectItem(selectUp(lines))
    }

    if (input === "a") {
      toggleSelectAll(a => !a)
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
          selectItem(selectDown(lines))
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
        selectItem(0)
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

export default function Status({initialLines}) {
  const {exit} = useApp()
  const [mode, setMode] = useState("add")
  const [selected, selectItem] = useState(0)
  const [allSelected, toggleSelectAll] = useState(false)
  const [log, setLog] = useState([])
  const [lines, setLines] = useState(initialLines)
  const [_, rows] = useStdoutDimensions()

  useInput(getInputConfig({
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
  }))

  if (mode === "log") {
    const maxHeight = rows ? rows - 8 : log.length
    return <Selectable maxHeight={maxHeight} data={log} selected={selected} />
  }

  if (mode === "add") {
    const maxHeight = rows ? rows - 8 : lines.length
    return (
      <Box>
        <Selectable
          maxHeight={maxHeight}
          data={lines}
          selected={selected}
          allSelected={allSelected}
        />
        <Box height={1} />
      </Box>
    )
  }
}
