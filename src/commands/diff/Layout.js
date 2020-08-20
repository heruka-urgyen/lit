import React, {useReducer, useState, useEffect} from "react"
import PropTypes from "prop-types"
import {Box, useInput, useStdout} from "ink"
import stripAnsi from "strip-ansi"

import {getActions as getStatusActions} from "commands/status/reducer"
import Status from "commands/status/View"

import Preview from "./Preview"
import reducer, {getActions} from "./reducer"
import {showPreview} from "./utils"

export default function Layout(props) {
  const {
    initialLines,
    minHeight,
    maxHeight,
  } = props

  const {stdout} = useStdout()
  const screenWidth = stdout.columns
  const longestName = Math.max(...initialLines.map(x => stripAnsi(x).length))
  const initialWidth = Math.round(
    Math.max(20, ((screenWidth - longestName - 5) * 100) / screenWidth),
  )

  const initialState = {
    status: {
      mode: "add",
      selected: 0,
      allSelected: false,
      log: [],
      lines: initialLines,
    },
    diff: {
      width: initialWidth,
      preview: "",
      previewPosition: 0,
      mode: {
        type: "normal",
        previousWidth: 95,
        currentWidth: initialWidth,
      },
    },
  }
  const [timesPressed, press] = useState(0)
  const [previewHidden, togglePreview] = useState(false)
  const [state1, dispatch] = useReducer(reducer, initialState.status)
  const statusActions = getStatusActions(dispatch)
  const [state2, dispatch2] = useReducer(reducer, initialState.diff)
  const {selected, lines} = state1
  const {width, preview, mode, previewPosition} = state2

  const {
    setWidth,
    setPreview,
    toggleMode,
    scrollPreview,
  } = getActions(dispatch2)

  useEffect(() => {
    if (state1.mode === "add") {
      showPreview(setPreview, lines[selected].split(" ").slice(-1)[0])
    }
  }, [selected])

  useEffect(() => {
    setWidth(() => mode.currentWidth)
  }, [mode.type])

  useEffect(() => {
    const t = setTimeout(() => press(0), 500)

    return () => clearTimeout(t)
  }, [timesPressed])

  useInput((input, key) => {
    if (input === "v") {
      toggleMode()
      statusActions.setMode(state1.mode === "preview" ? "add" : "preview")
    }

    if (mode.type === "preview") {
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

    if (mode.type === "normal") {
      if (input === "l" || key.rightArrow) {
        setWidth(w => Math.max(5, w - 10))
      }

      if (input === "h" || key.leftArrow) {
        setWidth(w => Math.min(95, w + 10))
      }

      if (input === "f") {
        togglePreview(p => !p)
        setWidth(() => 0)
      }
    }
  })

  return (
    <Box height={maxHeight} flexDirection="row" paddingTop={1}>
      <Box width={`${100 - width}%`} marginTop={-1}>
        <Status
          state={state1}
          actions={statusActions}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      </Box>
      <Box
        display={previewHidden ? "none" : "flex"}
        width={`${width}%`}
        borderStyle="round"
        borderColor={mode.type === "normal" ? "grey" : "green"}
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
