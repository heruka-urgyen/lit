import path from "path"
import {statusStrToList} from "utils"
import stripAnsi from "strip-ansi"

import {
  isPathRelative,
  gitRoot,
  runCmd,
  gitStatus,
  gitHasStagedFiles,
  gitLog,
  gitCommit,
  gitCommitAmend,
  gitCommitFixup,
} from "git-utils"

export const runCommand = async (cmd, fs, update) => {
  const rel = await isPathRelative()
  const root = await gitRoot()
  const files = fs.map(f => f.split(" ").slice(-1)[0].replace("\r", ""))
    .map(file => rel ? file : path.resolve(root, file))

  await runCmd({params: [cmd, ...files]})
  const data = await gitStatus()
  const preparedData = statusStrToList(data)
  update(preparedData)

  return preparedData
}

export const commit = async exit => {
  const hasStagedFiles = await gitHasStagedFiles()

  if (hasStagedFiles) {
    process.stdin.pause()
    await gitCommit()
    exit()
  }
}

export const commitAmend = async exit => {
  const hasStagedFiles = await gitHasStagedFiles()

  if (hasStagedFiles) {
    process.stdin.pause()
    await gitCommitAmend()
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
