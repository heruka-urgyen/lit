import {last, delay, parseCommitHash} from "utils"

import {
  gitHasStagedFiles,
  gitCheckout,
  gitRebase,
} from "git-utils"

import {
  runCommand,
  commit,
  commitAmend,
  commitFixup,
  updateLog,
} from "asyncHandlers"

let t
let timesPressed = 0
const press = n => {
  clearTimeout(t)
  t = setTimeout(() => press(0), 500)
  timesPressed = n % 2
}

const getKeyMap = as => ({
  quit: {
    modes: ["*"],
    keys: ["q"],
    action: async () => {
      await delay(0)
      as.exit()
    },
  },
  selectAll: {
    modes: ["status", "diff"],
    keys: ["a"],
    action: state => {
      const {modes} = state.app

      if (last(modes) !== "log") {
        as.toggleSelectAll()
      }
    },
  },
  add: {
    modes: ["status", "diff"],
    keys: ["s"],
    action: state => {
      const {setFiles} = as
      const {modes} = state.app
      const {allSelected, files, selected} = state.status

      if (last(modes) !== "log") {
        if (allSelected) {
          runCommand("add", files, setFiles)
        } else {
          runCommand("add", [files[selected]], setFiles)
        }
      }
    },
  },
  reset: {
    modes: ["status", "diff"],
    keys: ["r"],
    action: state => {
      const {setFiles} = as
      const {modes} = state.app
      const {allSelected, files, selected} = state.status

      if (last(modes) !== "log") {
        if (allSelected) {
          runCommand("reset", files, setFiles)
        } else {
          runCommand("reset", [files[selected]], setFiles)
        }
      }
    },
  },
  checkout: {
    modes: ["status", "diff"],
    keys: ["o"],
    action: async state => {
      let res
      const {exit, selectItem, setFiles} = as
      const {modes} = state.app
      const {allSelected, files, selected} = state.status

      if (last(modes) !== "log") {
        if (allSelected) {
          res = await runCommand("checkout", files, setFiles)
        } else {
          res = await runCommand("checkout", [files[selected]], setFiles)
        }

        const filesChanged = res.join() !== files.join()

        if (filesChanged) {
          if (allSelected || res.length === 0) {
            exit()
          } else {
            selectItem(s => Math.min(s, res.length - 1))
          }
        }
      }
    },
  },
  commit: {
    modes: ["status", "diff"],
    keys: ["c"],
    action: state => {
      const {modes} = state.app

      if (last(modes) !== "log") {
        commit(as.exit)
      }
    },
  },
  amend: {
    modes: ["status", "diff"],
    keys: ["m"],
    action: state => {
      const {modes} = state.app

      if (last(modes) !== "log") {
        commitAmend(as.exit)
      }
    },
  },
  fixup: {
    modes: ["status", "diff"],
    keys: ["f"],
    action: async state => {
      const {setLog, setMode, selectItem} = as
      const {modes} = state.app
      const hasStagedFiles = await gitHasStagedFiles()

      if (last(modes) !== "log" && hasStagedFiles) {
        updateLog(setLog)
        setMode("log")
        selectItem(() => 0)
      }
    },
  },
  showPreview: {
    modes: ["diff"],
    keys: ["v"],
    action: _ => {
      as.setMode("preview")
    },
  },
  hide: {
    modes: ["diff"],
    keys: ["f"],
    action: _ => {
      as.setWidth(_ => 0)
    },
  },
  resizeLeft: {
    modes: ["diff"],
    keys: ["h", "leftArrow"],
    action: _ => {
      as.setWidth(w => Math.min(95, w + 10))
    },
  },
  resizeRight: {
    modes: ["diff"],
    keys: ["l", "rightArrow"],
    action: _ => {
      as.setWidth(w => Math.max(5, w - 10))
    },
  },
  backToLog: {
    modes: ["diff"],
    keys: ["b"],
    action: async _ => {
      await delay(0)
      as.setMode("log")
    },
  },
  hidePreview: {
    modes: ["preview"],
    keys: ["v"],
    action: _ => {
      as.setMode("diff")
    },
  },
  scrollDown: {
    modes: ["preview"],
    keys: ["j", "downArrow"],
    action: _ => {
      as.scrollPreview(
        ({previewPosition, previewLength, maxHeight}) => Math.max(
          0,
          Math.min(previewPosition + 1, previewLength - maxHeight + 1),
        ),
      )
    },
  },
  scrollDownHalf: {
    modes: ["preview"],
    keys: ["d"],
    action: _ => {
      as.scrollPreview(
        ({previewPosition, previewLength, maxHeight}) => Math.max(
          0,
          Math.min(previewPosition + maxHeight / 2, previewLength - maxHeight + 1),
        ),
      )
    },
  },
  scrollUp: {
    modes: ["preview"],
    keys: ["k", "upArrow"],
    action: _ => {
      as.scrollPreview(({previewPosition}) => Math.max(0, previewPosition - 1))
    },
  },
  scrollUpHalf: {
    modes: ["preview"],
    keys: ["u"],
    action: _ => {
      as.scrollPreview(
        ({previewPosition, maxHeight}) => Math.max(0, previewPosition - maxHeight / 2),
      )
    },
  },
  scrollTop: {
    modes: ["preview"],
    keys: ["g"],
    action: _ => {
      const p = timesPressed + 1
      press(p)

      if (p > 1) {
        as.scrollPreview(_ => 0)
      }
    },
  },
  scrollBottom: {
    modes: ["preview"],
    keys: ["G"],
    action: _ => {
      as.scrollPreview(
        ({previewLength, maxHeight}) => Math.max(0, previewLength - maxHeight + 1),
      )
    },
  },
  selectCommit: {
    modes: ["log"],
    keys: ["return"],
    action: state => {
      const lastMode = last(state.app.modes)

      if (lastMode === "status" || lastMode === "diff") {
        const {data, selected} = state.log
        commitFixup(data[selected], as.exit)
      }
    },
  },
  back: {
    modes: ["log"],
    keys: ["b"],
    action: _ => {
      as.setMode("status")
    },
  },
  checkoutCommit: {
    modes: ["log"],
    keys: ["o"],
    action: async state => {
      const {data, selected} = state.log
      const commit = data[selected]
      await gitCheckout([parseCommitHash(commit)])
      as.exit()
    },
  },
  rebaseCommit: {
    modes: ["log"],
    keys: ["r"],
    action: async state => {
      const {data, selected} = state.log
      const commit = data[selected]
      await gitRebase(["--interactive", parseCommitHash(commit)])
      as.exit()
    },
  },
  showDiffForCommit: {
    modes: ["log"],
    keys: ["l", "return"],
    action: async _ => {
      await delay(0)
      as.setFiles([])
      as.setMode("diff")
    },
  },
})

const activate = (input, key, state) => a => {
  a.keys.forEach(k => {
    if (input === k || key[k]) {
      a.action(state)
    }
  })
}

export default ({actions, state}) => async (input, key) => {
  const {mode} = state.app
  const keyMap = getKeyMap(actions)
  const use = activate(input, key, state)

  Object.values(keyMap).forEach(v => {
    if (v.modes.find(x => x === "*") || v.modes.find(x => x === mode)) {
      use(v)
    }
  })
}