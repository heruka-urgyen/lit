import React, {useEffect} from "react"
import PropTypes from "prop-types"
import {useApp, useInput} from "ink"

import {gitCheckout, gitRebase} from "git-utils"
import DiffContainer from "components/DiffContainer"
import Log from "components/Log"

import {getCommitFiles, showPreview, handleInput} from "commands/log"

export default function LogContainer({state, actions, minHeight, maxHeight}) {
  const {mode} = state.app
  const {files} = state.status
  const {data, selected} = state.log
  const {setMode, setFiles} = actions
  const {exit} = useApp()

  useEffect(() => {
    if (mode === "diff") {
      getCommitFiles(data[selected]).then(setFiles)
    }
  }, [mode])

  useInput(handleInput({
    exit,
    gitCheckout,
    gitRebase,
    commit: data[selected],
    mode,
    setMode,
    setFiles,
  }))

  if ((mode === "diff" || mode === "preview") && files.length > 0) {
    return (
      <DiffContainer
        actions={actions}
        state={state}
        minHeight={minHeight}
        maxHeight={maxHeight}
        showPreview={showPreview(data[selected])}
      />
    )
  }

  return (
    <Log
      minHeight={minHeight}
      maxHeight={maxHeight}
      state={state}
      actions={actions}
    />
  )
}

const {shape, arrayOf, string, number, func} = PropTypes

LogContainer.propTypes = {
  state: shape({
    app: shape({mode: string.isRequired}).isRequired,
    log: shape({
      data: arrayOf(string).isRequired,
      selected: number.isRequired,
    }).isRequired,
    status: shape({
      files: arrayOf(string).isRequired,
    }).isRequired,
  }).isRequired,
  actions: shape({
    setMode: func.isRequired,
    setFiles: func.isRequired,
  }).isRequired,
  minHeight: number.isRequired,
  maxHeight: number.isRequired,
}
