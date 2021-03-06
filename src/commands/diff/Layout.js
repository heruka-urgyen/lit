import React, {useReducer, useEffect} from "react"
import PropTypes from "prop-types"
import {Box, Text, useInput, useStdout} from "ink"
import stripAnsi from "strip-ansi"

import {combineReducers} from "utils"

import statusReducer, {getActions as getStatusActions} from "commands/status/reducer"
import Status from "commands/status/View"

import Preview from "./Preview"
import reducer, {getActions} from "./reducer"
import {calcuateScrollPosition, resizePreview} from "./utils"

export default function Layout({getHint, initialLines, minHeight, maxHeight, showPreview}) {
  const {stdout} = useStdout()
  const screenWidth = stdout.columns
  const longestName = Math.max(...initialLines.map(x => stripAnsi(x).length))
  const initialWidth = Math.round(
    Math.max(20, ((screenWidth - longestName - 5) * 100) / screenWidth),
  )

  const initialState = {
    status: {
      mode: "status",
      selected: 0,
      allSelected: false,
      log: [],
      lines: initialLines,
    },
    diff: {
      minHeight,
      maxHeight,
      width: initialWidth,
      previousWidth: initialWidth,
      previewWidth: 95,
      preview: "",
      previewPosition: 0,
    },
  }

  const [state, dispatch] = useReducer(
    combineReducers({status: statusReducer, diff: reducer}),
    initialState,
  )
  const statusActions = getStatusActions(dispatch)
  const {setWidth, setPreview, scrollPreview} = getActions(dispatch)

  const {selected, lines, mode} = state.status
  const {width, preview, previewPosition, previousWidth, previewWidth} = state.diff
  const hint = getHint(mode)

  useEffect(() => {
    if (mode === "status" && lines[selected] != null) {
      showPreview(setPreview, lines[selected].split(" ").slice(-1)[0])
    }
  }, [selected, lines.length])

  useEffect(() => {
    if (mode === "status") {
      setWidth(_ => previousWidth)
    }

    if (mode === "preview") {
      setWidth(_ => previewWidth)
    }
  }, [mode])

  useInput((input, key) => {
    if (input === "v") {
      statusActions.setMode(mode === "preview" ? "status" : "preview")
    }

    if (mode === "preview") {
      scrollPreview(calcuateScrollPosition(input, key))
    }

    if (mode === "status") {
      setWidth(resizePreview(input, key))
    }
  })

  return (
    <Box flexDirection="column">
      <Text>{hint}</Text>
      <Box height={maxHeight} flexDirection="row">
        <Box width={`${100 - width}%`}>
          <Status
            state={state.status}
            actions={statusActions}
            minHeight={minHeight}
            maxHeight={maxHeight}
          />
        </Box>
        <Box
          display={width > 0 ? "flex" : "none"}
          width={`${width}%`}
          borderStyle="round"
          borderColor={mode === "status" ? "grey" : "green"}
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
    </Box>
  )
}

Layout.propTypes = {
  initialLines: PropTypes.arrayOf(PropTypes.string).isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  showPreview: PropTypes.func.isRequired,
  getHint: PropTypes.func.isRequired,
}
