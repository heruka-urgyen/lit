import stripAnsi from "strip-ansi"

export const parseCommitHash = str => stripAnsi(str.split(" ")[0])
