import React from "react"
import PropTypes from "prop-types"
import {useApp, useInput} from "ink"
import chalk from "chalk"

import Selectable from "components/Selectable"
import Log from "components/Log"

import {identity} from "utils"
import {runCommand, commit, commitAmend, commitFixup, updateLog, handleInput} from "commands/status"

export default function Status({state, actions, minHeight, maxHeight}) {
  const {exit} = useApp()
  const {mode} = state.app
  const {selected, allSelected, log, files} = state.status
  const {
    setMode,
    selectItem,
    toggleSelectAll,
    setLog,
    setFiles,
  } = actions

  useInput(handleInput({
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
  }))

  if (mode === "log") {
    return (
      <Log
        actions={actions}
        state={{log: {data: log, selected: state.log.selected}}}
        minHeight={minHeight}
        maxHeight={maxHeight}
      />
    )
  }

  if (mode === "status" || mode === "preview" || mode === "diff") {
    return (
      <Selectable
        minHeight={minHeight}
        maxHeight={maxHeight}
        data={files.map(x => chalk.reset(x))}
        selected={selected}
        allSelected={allSelected}
        selectItem={mode === "preview" ? identity : selectItem}
      />
    )
  }

  return null
}

const {shape, arrayOf, string, number, bool, func} = PropTypes

Status.propTypes = {
  state: shape({
    app: shape({mode: string.isRequired}).isRequired,
    log: shape({selected: number.isRequired}).isRequired,
    status: shape({
      selected: number.isRequired,
      allSelected: bool.isRequired,
      log: arrayOf(string).isRequired,
      files: arrayOf(string).isRequired,
    }).isRequired,
  }).isRequired,
  actions: shape({
    setMode: func.isRequired,
    selectItem: func.isRequired,
    toggleSelectAll: func.isRequired,
    setLog: func.isRequired,
    setFiles: func.isRequired,
  }).isRequired,
  minHeight: number.isRequired,
  maxHeight: number.isRequired,
}
