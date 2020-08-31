/* eslint-disable arrow-body-style */

import {createReducer, dispatchAction} from "utils"

export const handlers = {
  selectItem: (s, {payload}) => {
    return {
      ...s,
      selected: payload(s.selected),
    }
  },
  setMode: (s, {payload}) => {
    return {
      ...s,
      mode: payload,
    }
  },
  setFiles: (s, {payload}) => {
    return {
      ...s,
      files: payload,
    }
  },
}

export const getActions = dispatch => {
  const [
    selectItem,
    setMode,
    setFiles,
  ] = [
    "selectItem",
    "setMode",
    "setFiles",
  ].map(dispatchAction(dispatch))

  return {
    selectItem,
    setMode,
    setFiles,
  }
}

export default createReducer(handlers)
