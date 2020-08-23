Lit
===

> Interactive git tools

Lit is a set of interactive git tools that aims to automate tedious git tasks.

## Installation
`npm i -g @heruka_urgyen/lit`

## Usage
`lit [--help] <command>`

## Commands

### Status
Usage: `lit status`

Git status with interactive cli for selecting files.
It provides operations, such as _stage_, _reset_, _checkout_, _commit_, _commit --amend_ and _commit --fixup_.
The last one will open git log to select a commit for fixup.

![status-image](images/status.png)

### Diff
Usage: `lit diff`

Interactive git diff that combines status with diff for each file.
List of files is displayed on the left and diff is displayed on the right.
The diff pane can be resized with `h` and `l` and focus toggled with `v`.
When focused, navigation keys scroll the diff.

![diff-image](images/diff.png)

## License
GPL-3.0
