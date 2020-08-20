/* eslint-disable arrow-body-style */

import {createReducer, dispatchAction} from "utils"

export const actionHandlers = {
  setMode: (s, {payload}) => {
    return {
      ...s,
      mode: payload,
    }
  },
  selectItem: (s, {payload}) => {
    return {
      ...s,
      selected: payload(s.selected),
    }
  },
  toggleSelectAll: s => {
    return {
      ...s,
      allSelected: !s.allSelected,
    }
  },
  setLog: (s, {payload}) => {
    return {
      ...s,
      log: payload,
    }
  },
  setLines: (s, {payload}) => {
    return {
      ...s,
      lines: payload,
    }
  },
}

export const getActions = dispatch => {
  const [
    setMode,
    selectItem,
    toggleSelectAll,
    setLog,
    setLines,
  ] = [
    "setMode",
    "selectItem",
    "toggleSelectAll",
    "setLog",
    "setLines",
  ].map(dispatchAction(dispatch))

  return {
    setMode,
    selectItem,
    toggleSelectAll,
    setLog,
    setLines,
  }
}

export default createReducer(actionHandlers)
