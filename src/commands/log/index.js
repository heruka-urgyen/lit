import process from "process"

import React, {useReducer} from "react"
import cliCursor from "cli-cursor"

import reducer, {getActions} from "./reducer"
import {getData, preRender, getHint, getComponent} from "./prepare"

(async () => {
  try {
    cliCursor.hide()
    const data = await getData()

    if (data.length === 0) {
      process.exit()
    }

    const minHeight = process.stdout.rows - 7
    const maxHeight = process.stdout.rows - 7
    preRender(getHint())(data)(maxHeight)(minHeight)

    const Log = await getComponent()
    const {render, Box, Text} = await import("ink")

    const App = () => {
      const initialState = {
        selected: 0,
        data,
        mode: "log",
        files: [],
      }

      const [state, dispatch] = useReducer(reducer, initialState)
      const actions = getActions(dispatch)
      const hint = getHint()

      if (state.mode === "log") {
        return (
          <Box flexDirection="column">
            <Text>{hint}</Text>
            <Log
              state={state}
              actions={actions}
              minHeight={minHeight}
              maxHeight={maxHeight}
            />
          </Box>
        )
      }

      return (
        <Log
          state={state}
          actions={actions}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      )
    }

    render(<App />)
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
    process.exit()
  }
})()
