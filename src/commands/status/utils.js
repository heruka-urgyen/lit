import stripAnsi from "strip-ansi"
import {statusStrToList} from "utils"
import {
  runCmd,
  gitStatus,
  gitDiff,
  gitCommit,
  gitCommitAmend,
  gitCommitFixup,
  gitLog,
} from "git-utils"

export const runCommand = async (cmd, f, update) => {
  const file = f.split(" ").slice(-1)[0].replace("\r", "")
  await runCmd({params: [cmd, file]})
  const data = await gitStatus()
  update(statusStrToList(data))
}

export const commit = async exit => {
  const output = await gitDiff()

  if (output.length > 0) {
    process.stdin.pause()
    await gitCommit()
    exit()
  }
}

export const commitFixup = async (commit, exit) => {
  const hash = stripAnsi(commit).match(/[^\s]+/)[0]

  process.stdin.pause()
  await gitCommitFixup(hash)
  exit()
}

export const commitAmend = async exit => {
  const output = await gitDiff()

  if (output.length > 0) {
    process.stdin.pause()
    await gitCommitAmend()
    exit()
  }
}

export const updateLog = async update => {
  const output = await gitLog()
  update(output.split("\n").slice(0, -1))
}
