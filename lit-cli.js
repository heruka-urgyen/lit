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
  `)
}

const runCli = command => {
  if (!command || command === "--help") {
    return printHelp()
  }

  if (command === "status") {
    return require("./dist/status")
  }

  return printUsage()
}

runCli(process.argv[2])
