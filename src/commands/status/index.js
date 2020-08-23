import process from "process"

import React, {useReducer} from "react"
import cliCursor from "cli-cursor"

import reducer, {getActions} from "./reducer"
import {getData, preRender, getHint, getComponent, render} from "./prepare"

(async () => {
  try {
    cliCursor.hide()
    const data = await getData()

    if (data.length === 0) {
      process.exit()
    }

    const minHeight = 0
    const maxHeight = process.stdout.rows - 8
    preRender(getHint())(data)(maxHeight)(minHeight)

    const Status = await getComponent()

    const App = () => {
      const initialState = {
        mode: "status",
        selected: 0,
        allSelected: false,
        log: [],
        lines: data,
      }

      const [state, dispatch] = useReducer(reducer, initialState)
      const actions = getActions(dispatch)

      return (
        <Status
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
