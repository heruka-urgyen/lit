import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import {
  parseCommitHash,
  getCommitFiles,
  showPreview,
  handleInput,
} from "commands/log/log-utils"
import * as u from "utils"
import * as gu from "git-utils"

let getPagerStub
let gitShowStub
let pipeStub

test.beforeEach(() => {
  getPagerStub = sinon.stub(gu, "getPager")
  gitShowStub = sinon.stub(gu, "gitShow")
  pipeStub = sinon.stub(u, "pipe")
})

test.afterEach(() => {
  getPagerStub.restore()
  gitShowStub.restore()
  pipeStub.restore()
})

testProp.serial(
  "should parse commit hash",
  [fc.hexaString(7, 7), fc.unicodeString(1), fc.integer(1), fc.base64String(1)],
  async (t, hash, msg, timestamp, author) => {
    const commit = `${hash} - ${msg} (${timestamp} time ago) <${author}>`

    const res = parseCommitHash(commit)

    t.deepEqual(res, hash)
  },
)

testProp.serial(
  "should get commit files",
  [
    fc.hexaString(7, 7),
    fc.unicodeString(1),
    fc.integer(1),
    fc.base64String(1),
    fc.base64String(1),
    fc.base64String(1),
    fc.base64String(1),
  ],
  async (t, hash, msg, timestamp, author, file1, file2, file3) => {
    const statusStrToListStub = sinon.stub(u, "statusStrToList")
    const gitCommittedFilesStub = sinon.stub(gu, "gitCommittedFiles")
    const commit = `${hash} - ${msg} (${timestamp} time ago) <${author}>`
    const filesStr = `M\t${file1}\nD\t${file2}\nA\t${file3}`

    gitCommittedFilesStub.resolves(filesStr)

    await getCommitFiles(commit)

    t.truthy(gitCommittedFilesStub.calledWith([hash]))
    t.truthy(statusStrToListStub.calledWith(`M ${file1}\nD ${file2}\nA ${file3}`))

    statusStrToListStub.restore()
    gitCommittedFilesStub.restore()
  },
)

testProp.serial(
  "should show preview",
  [
    fc.hexaString(7, 7),
    fc.unicodeString(1),
    fc.integer(1),
    fc.base64String(1),
    fc.base64String(1),
    fc.base64String(1),
  ],
  async (t, hash, msg, timestamp, author, file, diff) => {
    const updateSpy = sinon.spy()
    const commit = `${hash} - ${msg} (${timestamp} time ago) <${author}>`

    getPagerStub.resolves(null)
    pipeStub.resolves(diff)

    await showPreview(commit)(updateSpy, file)
    t.truthy(gitShowStub.calledWith([hash, "--", file]))
    t.truthy(updateSpy.calledWith(diff))
  },
)

test.serial("should handle input", async t => {
  const props = {
    exit: sinon.spy(),
    gitCheckout: sinon.spy(),
    gitRebase: sinon.spy(),
    commit: "",
    mode: "log",
    setMode: sinon.spy(),
    setFiles: sinon.spy(),
  }

  const hi = handleInput(props)

  await hi("q", {})
  t.is(props.exit.callCount, 1)

  await hi("o", {})
  t.is(props.gitCheckout.callCount, 1)
  t.is(props.exit.callCount, 2)

  await hi("r", {})
  t.is(props.gitRebase.callCount, 1)
  t.is(props.exit.callCount, 3)

  await hi("l", {})
  t.truthy(props.setMode.calledWith("diff"))

  await hi("", {return: true})
  t.truthy(props.setMode.calledWith("diff"))

  const hi2 = handleInput({...props, mode: "diff"})

  await hi2("b", {})
  t.truthy(props.setFiles.calledWith([]))
  t.truthy(props.setMode.calledWith("log"))

  await hi2("", {backspace: true})
  t.truthy(props.setFiles.calledWith([]))
  t.truthy(props.setMode.calledWith("log"))
})
