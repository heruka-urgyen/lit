#!/usr/bin/env node

/* eslint-disable global-require */
/* eslint-disable no-console */

const fs = require("fs")
const process = require("process")

const getUsageMessage = () => "Usage: lit [--version] [--help] <command>"

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

const showVersion = () => {
  try {
    const p = fs.readFileSync("./package.json", {encoding: "utf8"})
    const version = p.match(/"version":\s"(.+)",/)[1]

    console.log(version)
  } catch (e) {
    console.error(e)
  }
}

const runCli = command => {
  const app = require("./dist/index").default

  if (!command || command === "--help") {
    return printHelp()
  }

  if (command === "--version") {
    return showVersion()
  }

  if (command === "status") {
    return app("status")
  }

  if (command === "diff") {
    return app("diff")
  }

  if (command === "log") {
    return app("log")
  }

  return printUsage()
}

runCli(process.argv[2])
