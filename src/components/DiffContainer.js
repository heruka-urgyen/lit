import React, {useEffect} from "react"
import PropTypes from "prop-types"
import {Box, useStdout} from "ink"
import stripAnsi from "strip-ansi"

import Preview from "components/Preview"
import Status from "components/Status"
import {extractFilename} from "utils"

export default function DiffContainer({state, actions, minHeight, maxHeight, showPreview}) {
  const {stdout} = useStdout()
  const screenWidth = stdout.columns
  const {setWidth, setPreview} = actions
  const {mode} = state.app
  const {selected, files} = state.status
  const {width, preview, previewPosition} = state.diff

  useEffect(() => {
    if (mode === "diff" && files[selected] != null) {
      showPreview(setPreview, extractFilename(files[selected]))
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
  }, [mode])

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
