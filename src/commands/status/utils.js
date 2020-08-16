import stripAnsi from "strip-ansi"
import {statusStrToList} from "utils"
import {runCmd, gitStatus, gitDiff, gitCommit, gitCommitFixup, gitLog} from "git-utils"

export const runCommand = (cmd, f, update) => {
  const file = f.split(" ").slice(-1)[0].replace("\r", "")
  runCmd({params: [cmd, file]}).on("close", () => {
    gitStatus().on("data", data => {
      update(statusStrToList(data))
    })
  })
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

export const updateLog = async update => {
  const output = await gitLog()
  update(output.split("\n").slice(0, -1))
}