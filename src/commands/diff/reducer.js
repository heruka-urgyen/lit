/* eslint-disable arrow-body-style */

import {createReducer, dispatchAction} from "utils"
import {actionHandlers} from "commands/status/reducer"

export const handlers = {
  ...actionHandlers,
  setWidth: (s, {payload}) => {
    return {
      ...s,
      width: payload(s.width),
    }
  },
  setPreview: (s, {payload}) => {
    const lines = payload.split("\n")
    const metadataLength = lines.findIndex(x => x.indexOf("@@") > -1)

    return {
      ...s,
      preview: lines.slice(metadataLength).join("\n"),
      previewPosition: 0,
    }
  },
  scrollPreview: (s, {payload}) => {
    return {
      ...s,
      previewPosition: payload(s.previewPosition),
    }
  },
  toggleMode: s => {
    const model = {
      previousWidth: s.width,
      currentWidth: s.mode.previousWidth,
    }

    return {
      ...s,
      mode: {...model, type: s.mode.type === "normal" ? "preview" : "normal"},
    }
  },
}

export const getActions = dispatch => {
  const [
    setWidth,
    setPreview,
    toggleMode,
    scrollPreview,
  ] = [
    "setWidth",
    "setPreview",
    "toggleMode",
    "scrollPreview",
  ].map(dispatchAction(dispatch))

  return {
    setWidth,
    setPreview,
    toggleMode,
    scrollPreview,
  }
}

export default createReducer(handlers)
