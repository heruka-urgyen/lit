import React, {useReducer, useState, useEffect} from "react"
import PropTypes from "prop-types"
import {Box, useInput, useStdout} from "ink"
import stripAnsi from "strip-ansi"

import {combineReducers} from "utils"

import statusReducer, {getActions as getStatusActions} from "commands/status/reducer"
import Status from "commands/status/View"

import Preview from "./Preview"
import reducer, {getActions} from "./reducer"
import {showPreview} from "./utils"

export default function Layout({initialLines, minHeight, maxHeight}) {
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
      width: initialWidth,
      previousWidth: initialWidth,
      previewWidth: 95,
      preview: "",
      previewPosition: 0,
    },
  }
  const [timesPressed, press] = useState(0)
  const [previewVisible, togglePreview] = useState(true)
  const [state, dispatch] = useReducer(
    combineReducers({status: statusReducer, diff: reducer}),
    initialState,
  )
  const statusActions = getStatusActions(dispatch)
  const {setWidth, setPreview, scrollPreview} = getActions(dispatch)

  const {selected, lines, mode} = state.status
  const {width, preview, previewPosition, previousWidth, previewWidth} = state.diff

  useEffect(() => {
    if (mode === "status") {
      showPreview(setPreview, lines[selected].split(" ").slice(-1)[0])
    }
  }, [selected])

  useEffect(() => {
    if (mode === "status") {
      setWidth(() => previousWidth)
    }

    if (mode === "preview") {
      setWidth(() => previewWidth)
    }
  }, [mode])

  useEffect(() => {
    const t = setTimeout(() => press(0), 500)

    return () => clearTimeout(t)
  }, [timesPressed])

  useInput((input, key) => {
    if (input === "v") {
      statusActions.setMode(mode === "preview" ? "status" : "preview")
    }

    if (mode === "preview") {
      if (input === "j" || key.downArrow) {
        scrollPreview(pos => {
          const lines = preview.split("\n").length

          if (lines > maxHeight) {
            return Math.min(pos + 1, lines - maxHeight + 1)
          }

          return pos
        })
      }

      if (input === "k" || key.upArrow) {
        scrollPreview(pos => Math.max(0, pos - 1))
      }

      if (input === "d") {
        scrollPreview(pos => {
          const lines = preview.split("\n").length

          if (lines > maxHeight) {
            return Math.min(pos + maxHeight / 2, lines - maxHeight + 1)
          }

          return pos
        })
      }

      if (input === "u") {
        scrollPreview(pos => Math.max(0, pos - maxHeight / 2))
      }

      if (input === "G" && key.shift) {
        const lines = preview.split("\n").length

        if (lines > maxHeight) {
          scrollPreview(_ => lines - maxHeight + 1)
        }
      }

      if (input === "g") {
        const p = timesPressed + 1
        press(p)

        if (p > 1) {
          scrollPreview(_ => 0)
        }
      }
    }

    if (mode === "status") {
      if (input === "l" || key.rightArrow) {
        setWidth(w => Math.max(5, w - 10))
      }

      if (input === "h" || key.leftArrow) {
        setWidth(w => Math.min(95, w + 10))
      }

      if (input === "f") {
        togglePreview(false)
        setWidth(() => 0)
      }
    }
  })

  return (
    <Box
      height={previewVisible ? maxHeight : maxHeight + 1}
      flexDirection="row"
      paddingTop={1}
    >
      <Box width={`${100 - width}%`} marginTop={-1}>
        <Status
          state={state.status}
          actions={statusActions}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      </Box>
      <Box
        display={previewVisible ? "flex" : "none"}
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
  )
}

Layout.propTypes = {
  initialLines: PropTypes.arrayOf(PropTypes.string).isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
}
