import React, {useEffect} from "react"
import PropTypes from "prop-types"
import {useApp, useInput} from "ink"

import {gitCheckout, gitRebase} from "git-utils"
import Layout from "commands/diff/Layout"

import {getCommitFiles, showPreview, handleInput} from "./log-utils"
import Log from "./Log"

export default function LogWrapper({state, actions, minHeight, maxHeight}) {
  const {data, selected, mode, files} = state
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

  if (mode === "diff" && files.length > 0) {
    return (
      <Layout
        initialLines={files}
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

LogWrapper.propTypes = {
  state: PropTypes.shape({
    selected: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.string).isRequired,
    mode: PropTypes.string.isRequired,
    files: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    setMode: PropTypes.func.isRequired,
    setFiles: PropTypes.func.isRequired,
  }).isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
}
