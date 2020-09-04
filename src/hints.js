import chalk from "chalk"

const ub = chalk.underline.bold

export const statusHint = {
  quit: {
    keys: ["q"],
    style: ub.yellow,
    hint: "quit ",
  },
  toggleAll: {
    keys: ["a"],
    style: ub.yellow,
    hint: "toggle all",
  },
  stage: {
    keys: ["s"],
    style: ub.green,
    hint: "stage",
  },
  reset: {
    keys: ["r"],
    style: ub.red,
    hint: "reset",
  },
  checkout: {
    keys: ["o"],
    style: ub.red,
    hint: "checkout",
  },
  commit: {
    keys: ["c"],
    style: ub.blue,
    hint: "commit",
  },
  amend: {
    keys: ["m"],
    style: ub.blue,
    hint: "amend",
  },
  fixup: {
    keys: ["f"],
    style: ub.blue,
    hint: "fixup",
  },
}

export const diffHint = {
  ...statusHint,
  togglePreview: {
    keys: ["v"],
    style: ub.yellow,
    hint: "toggle preview",
  },
  resize: {
    keys: ["h", "l"],
    style: ub.yellow,
    hint: "resize",
  },
}

export const logHint = {
  quit: {
    keys: ["q"],
    style: ub.yellow,
    hint: "quit",
  },
  commitDiff: {
    keys: ["l"],
    style: ub.yellow,
    hint: "commit diff",
  },
  backToLog: {
    keys: ["b"],
    style: ub.yellow,
    hint: "back to log",
  },
  checkout: {
    keys: ["o"],
    style: ub.red,
    hint: "checkout",
  },
  rebase: {
    keys: ["r"],
    style: ub.red,
    hint: "rebase",
  },
}
