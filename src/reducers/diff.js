/* eslint-disable arrow-body-style */

import {getActions, createReducer} from "utils"

export const handlers = {
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
    const lines = s.preview.split("\n").length

    return {
      ...s,
      previewPosition: payload({...s, previewLength: lines}),
    }
  },
}

export const actions = getActions(handlers)
export default createReducer(handlers)
