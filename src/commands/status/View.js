import React from "react"
import {Box, useApp, useInput} from "ink"
import chalk from "chalk"

import Selectable from "components/Selectable"

import {identity} from "utils"
import {runCommand, commit, commitAmend, commitFixup, updateLog, handleInput} from "./utils"

export default function Status({state, actions, minHeight, maxHeight}) {
  const {exit} = useApp()

  const {mode, selected, allSelected, log, lines} = state
  const {
    setMode,
    selectItem,
    toggleSelectAll,
    setLog,
    setLines,
  } = actions

  useInput(handleInput({
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
  }))

  if (mode === "log") {
    return (
      <Box paddingTop={1}>
        <Selectable
          minHeight={minHeight}
          maxHeight={maxHeight}
          data={log}
          selected={selected}
          selectItem={selectItem}
        />
      </Box>
    )
  }

  if (mode === "status" || mode === "preview") {
    return (
      <Box paddingTop={1}>
        <Selectable
          minHeight={minHeight}
          maxHeight={maxHeight}
          data={lines.map(x => chalk.reset(x))}
          selected={selected}
          allSelected={allSelected}
          selectItem={mode === "status" ? selectItem : identity}
        />
        <Box height={1} />
      </Box>
    )
  }
}
