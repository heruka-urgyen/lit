import cp from "child_process"
import {spawn} from "node-pty"

export const runCmd = ({params = [], options}) => spawn("git", params, options)

export const gitStatus = () => runCmd({
  params: ["-c", "color.ui=always", "status", "-s", "-u"],
})

export const gitCommit =
  (params = []) => cp.spawn("git", ["commit", ...params], {stdio: "inherit"})

export const gitCommitFixup = hash => gitCommit(["--fixup", hash])

export const gitDiff = () => new Promise(
  (res, rej) => cp.exec(
    "git diff --cached --name-only",
    {encoding: "utf8"},
    (e, stdout) => e ? rej(e) : res(stdout),
  ),
)

export const gitLog = () => new Promise(
  (res, rej) => cp.exec(
    "git log --color=always --format=" +
    "'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'",
    {encoding: "utf8"},
    (e, stdout) => e ? rej(e) : res(stdout),
  ),
)