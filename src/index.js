import process from "process"

import React, {useReducer} from "react"
import cliCursor from "cli-cursor"

import reducer from "reducers"

import {actions as getAppActions} from "reducers/app"
import {actions as getStatusActions} from "reducers/status"
import {actions as getDiffActions} from "reducers/diff"
import {actions as getLogActions} from "reducers/log"
import inputHandlers from "./inputHandlers"

const prepare = mode => import(`./commands/${mode}.js`)

export default async function App(initialMode) {
  try {
    cliCursor.hide()
    const {getData, getDimensions, preRender, getHint, getComponent, showPreview} =
      await prepare(initialMode)

    const data = await getData()

    if (data.length === 0) {
      process.exit()
    }

    const {minHeight, maxHeight} = getDimensions()
    preRender(getHint(initialMode))(data)(maxHeight)(minHeight)

    const Component = await getComponent(initialMode)
    const {render, useInput, useApp, Box, Text} = await import("ink")

    const Container = () => {
      const initialState = {
        app: {
          mode: initialMode,
          modes: [],
        },
        status: {
          selected: 0,
          allSelected: false,
          files: data,
        },
        diff: {
          minHeight,
          maxHeight,
          width: 0,
          preview: "",
          previewPosition: 0,
        },
        log: {
          selected: 0,
          data,
        },
      }

      const [state, dispatch] = useReducer(reducer, initialState)
      const actions = [getAppActions, getStatusActions, getDiffActions, getLogActions]
        .reduce((actions, f) => ({...actions, ...f(dispatch)}), {})

      const {exit} = useApp()

      useInput(inputHandlers({
        actions: {...actions, exit},
        state,
      }))

      return (
        <Box flexDirection="column">
          <Text>{getHint(state.app.mode)}</Text>
          <Component
            state={state}
            actions={actions}
            minHeight={minHeight}
            maxHeight={maxHeight + 1}
            showPreview={showPreview}
          />
        </Box>
      )
    }

    render(<Container />)
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e.message)
    process.exit()
  }
}
