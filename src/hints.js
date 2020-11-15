import {hint1, hint2, hint3, hint4} from "colors"

export const statusHint = {
  quit: {
    keys: ["q"],
    style: hint1,
    hint: "quit ",
  },
  back: {
    keys: ["b"],
    style: hint1,
    hint: "back to status",
  },
  toggleAll: {
    keys: ["a"],
    style: hint1,
    hint: "toggle all",
  },
  stage: {
    keys: ["s"],
    style: hint4,
    hint: "stage",
  },
  reset: {
    keys: ["r"],
    style: hint2,
    hint: "reset",
  },
  checkout: {
    keys: ["o"],
    style: hint2,
    hint: "checkout",
  },
  commit: {
    keys: ["c"],
    style: hint3,
    hint: "commit",
  },
  amend: {
    keys: ["m"],
    style: hint3,
    hint: "amend",
  },
  fixup: {
    keys: ["f"],
    style: hint3,
    hint: "fixup",
  },
}

export const diffHint = {
  ...statusHint,
  showPreview: {
    keys: ["v"],
    style: hint1,
    hint: "show preview",
  },
  hidePreview: {
    keys: ["v"],
    style: hint1,
    hint: "hide preview",
  },
  resize: {
    keys: ["h", "l"],
    style: hint1,
    hint: "resize",
  },
  scrollPreview: {
    keys: ["j", "k"],
    style: hint1,
    hint: "scroll preview",
  },
}

export const logHint = {
  quit: {
    keys: ["q"],
    style: hint1,
    hint: "quit",
  },
  commitDiff: {
    keys: ["l"],
    style: hint1,
    hint: "view commit diff",
  },
  backToLog: {
    keys: ["b"],
    style: hint1,
    hint: "back to log",
  },
  checkout: {
    keys: ["o"],
    style: hint2,
    hint: "checkout",
  },
  rebase: {
    keys: ["r"],
    style: hint2,
    hint: "rebase",
  },
}
