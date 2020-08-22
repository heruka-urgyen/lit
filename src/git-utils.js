import cp from "child_process"
import {spawn} from "node-pty"

export const runCmd = ({params = [], options}) => new Promise(res => {
  const buf = []
  const p = spawn("git", params, options)

  p.on("data", d => buf.push(d))
  p.on("exit", () => res(buf.reduce((x, y) => x + y, "")))
})

export const gitStatus = () => runCmd({
  params: ["-c", "color.ui=always", "status", "-s", "-u"],
})

export const gitCommit =
  (params = []) => cp.spawn("git", ["commit", ...params], {stdio: "inherit"})

export const gitCommitFixup = hash => gitCommit(["--fixup", hash])

export const gitCommitAmend = () => gitCommit(["--amend"])

const identity = _ => _
const exec = (cmd, resolver = identity) => new Promise(
  (res, rej) => cp.exec(
    cmd,
    {encoding: "utf8"},
    (e, stdout) => e ? rej(e) : res(resolver(stdout)),
  ),
)

const sp = (cmd, params) => new Promise(
  (res, rej) => {
    const c = cp.spawn(cmd, params)

    c.stderr.on("data", e => {
      rej(e.toString("utf8"))
    })

    c.stdout.on("data", data => {
      res(data.toString("utf8"))
    })
  },
)

export const gitDiff = params => sp("git", ["diff", "--color=always", ...params])
export const gitStatusPorcelain = file => exec(`git status --porcelain=2 ${file}`)

export const gitHasStagedFiles =
  () => exec("git diff --cached --name-only", x => x.length > 0)

export const gitLog =
  () => exec(
    "git log --color=always --format=" +
    "'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'",
  )

export const isGitRepo = () => exec("git rev-parse --is-inside-work-tree")
