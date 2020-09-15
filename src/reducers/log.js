/* eslint-disable arrow-body-style */

import {getActions, createReducer} from "utils"

export const handlers = {
  setLog: (s, {payload}) => {
    return {
      ...s,
      data: payload,
    }
  },
  selectLogItem: (s, {payload}) => {
    return {
      ...s,
      selected: payload(s.selected),
    }
  },
}

export const actions = getActions(handlers)
export default createReducer(handlers)
