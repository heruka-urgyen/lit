/* eslint-disable arrow-body-style */

import {getActions, createReducer} from "utils"

export const handlers = {
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
  setFiles: (s, {payload}) => {
    return {
      ...s,
      files: payload,
    }
  },
}

export const actions = getActions(handlers)
export default createReducer(handlers)
