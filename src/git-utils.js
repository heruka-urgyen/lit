import cp from "child_process"
import {identity} from "utils"

export const gitRebase =
  (params = []) => cp.spawn("git", ["rebase", ...params], {stdio: "inherit"})

export const gitCheckout =
  (params = []) => cp.spawn("git", ["checkout", ...params], {stdio: "inherit"})

export const gitCommit =
  (params = []) => cp.spawn("git", ["commit", ...params], {stdio: "inherit"})

export const gitCommitFixup = hash => gitCommit(["--fixup", hash])

export const gitCommitAmend = () => gitCommit(["--amend"])

const sp = (cmd, params, resolver = identity) => new Promise(
  (res, rej) => {
    let buf = ""
    const c = cp.spawn(cmd, params)

    c.stderr.on("data", e => {
      rej(e.toString("utf8"))
    })

    c.stdout.on("data", data => {
      buf = buf + data.toString("utf8")
    })

    c.on("close", _ => {
      res(resolver(buf))
    })
  },
)

export const getPager = async () => {
  const pager = await sp("git", ["config", "--get", "core.pager"])

  if (!pager) {
    return null
  }

  if (pager.match(/.+/)[0] === "delta") {
    return cp.spawn("delta", ["--color-only"])
  }

  return null
}

export const gitAdd = (params = []) => sp("git", ["add", ...params])
export const gitReset = (params = []) => sp("git", ["reset", ...params])
export const gitShow = params => sp("git", ["show", "--color=always", ...params])
export const gitCommittedFiles = params => sp(
  "git",
  ["diff-tree", "--no-commit-id", "--name-status", "-r", "--root", "-M", ...params],
)
export const gitDiff = params => sp("git", ["diff", "--color=always", ...params])
export const gitStatusPorcelain = file => sp(
  "git",
  ["status", "--porcelain=2", file].filter(identity),
)

export const gitHasStagedFiles =
  () => sp("git", ["diff", "--cached", "--name-only"], x => x.length > 0)

export const gitLog =
  () => sp(
    "git",
    [
      "log",
      "--color=always",
      "--format=" +
        "%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset",
    ],
  )

export const isGitRepo = () => sp("git", ["rev-parse", "--is-inside-work-tree"])
export const gitRoot =
  () => sp("git", ["rev-parse", "--show-toplevel"]).then(x => x.replace("\n", ""))
export const isPathRelative =
  () => sp("git", ["config", "status.relativePaths"], JSON.parse)
