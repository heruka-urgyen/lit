import chalk from "chalk"

const ub = chalk.underline.bold

export const statusHint = {
  quit: {
    keys: ["q"],
    style: ub.yellow,
    hint: "quit ",
  },
  back: {
    keys: ["b"],
    style: ub.yellow,
    hint: "back to status",
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
  showPreview: {
    keys: ["v"],
    style: ub.yellow,
    hint: "show preview",
  },
  hidePreview: {
    keys: ["v"],
    style: ub.yellow,
    hint: "hide preview",
  },
  resize: {
    keys: ["h", "l"],
    style: ub.yellow,
    hint: "resize",
  },
  scrollPreview: {
    keys: ["j", "k"],
    style: ub.yellow,
    hint: "scroll preview",
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
    hint: "view commit diff",
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
