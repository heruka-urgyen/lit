import path from "path"
import {statusStrToList} from "utils"
import stripAnsi from "strip-ansi"

import {
  isPathRelative,
  gitRoot,
  gitHasStagedFiles,
  gitLog,
  gitCommit,
  gitCommitAmend,
  gitCommitFixup,
  gitStatusPorcelain,
} from "git-utils"

export const runCommand = async (cmd, fs) => {
  const rel = await isPathRelative()
  const root = await gitRoot()
  const files = fs.map(f => f.split(" ").slice(-1)[0].replace("\r", ""))
    .map(file => rel ? file : path.resolve(root, file))
    .flatMap((file, _, files) => files.length > 1 ? [file] : ["--", file])

  await cmd(files)

  const status = await gitStatusPorcelain()
  const updatedFiles = statusStrToList(status)

  return updatedFiles
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
