/* eslint-disable arrow-body-style */

import {createReducer, dispatchAction} from "utils"

export const handlers = {
  selectItem: (s, {payload}) => {
    return {
      ...s,
      selected: payload(s.selected),
    }
  },
}

export const getActions = dispatch => {
  const [
    selectItem,
  ] = [
    "selectItem",
  ].map(dispatchAction(dispatch))

  return {
    selectItem,
  }
}

export default createReducer(handlers)
