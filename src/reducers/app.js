/* eslint-disable arrow-body-style */

import {getActions, createReducer} from "utils"

const handlers = {
  setMode: (s, {payload}) => {
    return {
      ...s,
      mode: payload,
    }
  },
}

export const actions = getActions(handlers)
export default createReducer(handlers)
