import cp from "child_process"
import process from "process"
import readline from "readline"
import cliCursor from "cli-cursor"
import React, {useState} from "react"
import {spawn} from "node-pty"
import stripAnsi from "strip-ansi"
import chalk from "chalk"

cliCursor.hide()

const SELECTOR = "❯"

const gitStatus = () => spawn("git", ["status", "-s", "-u"], {encoding: "utf8"})

const runCommand = (cmd, f, update) => {
  const file = f.split(" ").slice(-1)[0].replace("\r", "")
  spawn("git", [cmd, file]).on("close", () => {
    gitStatus().on("data", data => {
      update(data.split("\n").slice(0, -1))
    })
  })
}

const gitCommit = exit => {
  const {output} =
    cp.spawnSync("git", ["diff", "--cached", "--name-only"], {encoding: "utf8"})

  if (output[1].split("\n").filter(x => x.length > 0).length > 0) {
    process.stdin.pause()
    cp.spawn("git", ["commit"], {stdio: "inherit"}).on("exit", exit)
  }
}

const gitCommitFixup = (commit, exit) => {
  const hash = stripAnsi(commit).split(" ")[0]
  process.stdin.pause()
  cp.spawn("git", ["commit", "--fixup", hash], {stdio: "inherit"}).on("exit", exit)
}

const gitLog = update => {
  const {output} = cp.spawnSync(
    "git", [
      "log",
      "--color=always",
      "--format=%Cred%h%Creset -" +
      "%C(yellow)%d%Creset %s " +
      "%Cgreen(%cr) %C(bold blue)<%an>%Creset",
    ],
    {encoding: "utf8"},
  )

  update(output[1].split("\n"))
}

const cmd = gitStatus()
cmd.on("data", data => {
  const hint = `${chalk.green("s")} - stage | ` +
    `${chalk.red("r")} - reset | ` +
    `${chalk.blue("c")} - commit staged | ` +
    `${chalk.blue("f")} - fixup | ` +
    `${chalk.yellow("q")} - quit`

  const initialLines = data.split("\n").slice(0, -1)
  process.stdout.write(
    [hint, ""].concat(initialLines.concat(["", ""])).map(
      (l, i) => i === 2 ? ` ${SELECTOR} ${l}` : `   ${l}`,
    ).join("\n"),
  )

  readline.moveCursor(process.stdout, -initialLines[0].length, -initialLines.length - 1)

  import("ink").then(({render, Box, Text, useInput, useApp}) => {
    function Add() {
      const {exit} = useApp()
      const [selected, selectItem] = useState(0)
      const [log, updateLog] = useState([])
      const [mode, setMode] = useState("add")
      const [lines, setLines] = useState(initialLines)

      useInput((input, key) => {
        if (input === "q") {
          exit()
        }

        if (input === "j" || key.downArrow) {
          if (mode === "add") {
            selectItem(i => (i + 1) % lines.length)
          }

          if (mode === "log") {
            selectItem(i => (i + 1) % log.length)
          }
        }

        if (input === "k" || key.upArrow) {
          if (mode === "add") {
            selectItem(i => i > 0 ? i - 1 : lines.length - 1)
          }

          if (mode === "log") {
            selectItem(i => i > 0 ? i - 1 : log.length - 1)
          }
        }

        if (input === "s") {
          runCommand("add", lines[selected], setLines)
        }

        if (input === "r") {
          runCommand("reset", lines[selected], setLines)
        }

        if (input === "c") {
          gitCommit(exit)
        }

        if (input === "f") {
          const {output} =
            cp.spawnSync("git", ["diff", "--cached", "--name-only"], {encoding: "utf8"})

          if (output[1].split("\n").filter(x => x.length > 0).length > 0) {
            gitLog(updateLog)
            setMode("log")
            selectItem(0)
          }
        }

        if (key.return) {
          gitCommitFixup(log[selected], exit)
        }
      })

      if (mode === "log") {
        return (
          <Box flexDirection="column">
            {log.map((x, i) => (
              <Text key={x} wrap="truncate">
                {` ${selected === i ? SELECTOR : " "} ${x}`}
              </Text>
            ))}
          </Box>
        )
      }

      if (mode === "add") {
        return (
          <Box flexDirection="column">
            {lines.map((x, i) => (
              <Text key={x}>
                {` ${selected === i ? SELECTOR : " "} ${x}`}
              </Text>
            ))}
            <Box height={1} />
          </Box>
        )
      }
    }

    render(<Add />)
  })
})
