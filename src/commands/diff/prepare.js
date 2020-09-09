import {renderHint} from "utils"
import {diffHint} from "hints"

export const getHint = mode => {
  const style = {marginLeft: 1, marginTop: 1, marginBottom: 1}
  const {
    quit, back, toggleAll, showPreview, hidePreview, resize, scrollPreview,
    stage, reset, checkout, commit, amend, fixup,
  } = diffHint

  if (mode === "status") {
    return renderHint(style)([
      [quit, toggleAll, showPreview, showPreview, resize],
      [stage, reset, checkout, commit, amend, fixup],
    ])
  }

  if (mode === "preview") {
    return renderHint(style)([
      [quit, hidePreview, scrollPreview],
    ])
  }

  return renderHint(style)([
    [quit, back],
  ])
}
