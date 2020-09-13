import React, {useEffect} from "react"
import PropTypes from "prop-types"
import {Box, useInput, useStdout} from "ink"
import stripAnsi from "strip-ansi"

import Preview from "components/Preview"
import Status from "components/Status"

import {calcuateScrollPosition, resizePreview} from "commands/diff"

export default function DiffContainer({state, actions, minHeight, maxHeight, showPreview}) {
  const {stdout} = useStdout()
  const screenWidth = stdout.columns
  const {setMode, setWidth, setPreview, scrollPreview} = actions
  const {mode} = state.app
  const {selected, files} = state.status
  const {width, preview, previewPosition, previewWidth} = state.diff

  useEffect(() => {
    if (mode === "diff" && files[selected] != null) {
      showPreview(setPreview, files[selected].split(" ").slice(-1)[0])
    }
  }, [selected, files.length])

  useEffect(() => {
    if (mode === "diff") {
      const longestName = Math.max(...files.map(x => stripAnsi(x).length))
      const width = Math.round(
        Math.max(20, ((screenWidth - longestName - 5) * 100) / screenWidth),
      )
      setWidth(_ => width)
    }

    if (mode === "preview") {
      setWidth(_ => previewWidth)
    }
  }, [mode])

  useInput((input, key) => {
    if (input === "v") {
      setMode(mode === "preview" ? "diff" : "preview")
    }

    if (mode === "preview") {
      scrollPreview(calcuateScrollPosition(input, key))
    }

    if (mode === "diff") {
      setWidth(resizePreview(input, key))
    }
  })

  return (
    <Box height={maxHeight} flexDirection="row">
      <Box width={`${100 - width}%`}>
        <Status
          state={state}
          actions={actions}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      </Box>
      <Box
        display={width > 0 ? "flex" : "none"}
        width={`${width}%`}
        borderStyle="round"
        borderColor={mode === "diff" ? "grey" : "green"}
        marginTop={-1}
      >
        <Preview
          width={screenWidth * width * 0.01}
          height={maxHeight}
          previewPosition={previewPosition}
          preview={preview}
        />
      </Box>
    </Box>
  )
}

const {shape, arrayOf, func, string, number} = PropTypes

DiffContainer.propTypes = {
  state: shape({
    app: shape({mode: string.isRequired}).isRequired,
    diff: shape({
      width: PropTypes.number.isRequired,
      preview: PropTypes.string.isRequired,
      previewPosition: PropTypes.number.isRequired,
      previewWidth: PropTypes.number.isRequired,
    }).isRequired,
    status: shape({
      selected: number.isRequired,
      files: arrayOf(string).isRequired,
    }).isRequired,
  }).isRequired,
  actions: shape({
    setWidth: func.isRequired,
    setPreview: func.isRequired,
    scrollPreview: func.isRequired,
    setMode: func.isRequired,
  }).isRequired,
  minHeight: number.isRequired,
  maxHeight: number.isRequired,
  showPreview: func.isRequired,
}
