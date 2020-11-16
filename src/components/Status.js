import React from "react"
import PropTypes from "prop-types"
import chalk from "chalk"

import Selectable from "components/Selectable"
import Log from "components/Log"

import {identity} from "utils"

export default function Status({state, actions, minHeight, maxHeight}) {
  const {mode} = state.app
  const {selected, allSelected, files} = state.status
  const {data} = state.log
  const {selectItem} = actions

  if (mode === "fixup") {
    return (
      <Log
        actions={actions}
        state={{log: {data, selected: state.log.selected}}}
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
    log: shape({data: arrayOf(string).isRequired, selected: number.isRequired}).isRequired,
    status: shape({
      selected: number.isRequired,
      allSelected: bool.isRequired,
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
