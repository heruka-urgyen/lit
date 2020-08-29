#!/usr/bin/env node

/* eslint-disable global-require */
/* eslint-disable no-console */

const process = require("process")

const getUsageMessage = () => "Usage: lit [--help] <command>"

const printUsage = () => {
  console.log(getUsageMessage())
}

const printHelp = () => {
  console.log(`
  ${getUsageMessage()}

  Commands
    status - interactive git status that allows to stage, reset, checkout, commit, amend, and fixup
    diff - interactive git diff that combines git status with diff for each file
    log - interactive git log that allows inspecting diffs for each file in commit and simplifies interactive rebase
  `)
}

const runCli = command => {
  if (!command || command === "--help") {
    return printHelp()
  }

  if (command === "status") {
    return require("./dist/status")
  }

  if (command === "diff") {
    return require("./dist/diff")
  }

  if (command === "log") {
    return require("./dist/log")
  }

  return printUsage()
}

runCli(process.argv[2])
