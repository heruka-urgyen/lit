import path from "path"
import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"

import {
  getHint,
  preRender,
  getData,
  getCommitFiles,
  showPreview,
} from "commands/log"
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

    const res = u.parseCommitHash(commit)

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
    t.truthy(gitShowStub.calledWith([hash, "--", path.resolve(process.cwd(), file)]))
    t.truthy(updateSpy.calledWith(diff))
  },
)

test.serial("should return hint", async t => {
  const hint = getHint()

  const res = [
    "",
    " q quit | l view commit diff",
    " o checkout | r rebase",
    "",
  ].join("\n")

  t.deepEqual(hint, res)
})

test.serial("should pre-render view", async t => {
  const stdout = sinon.stub(process.stdout)
  const write = sinon.spy()
  stdout.columns = 50
  stdout.write = write

  preRender(getHint())(["123fab0 - commit msg (2 hours ago) <author>"])(20)(0)

  const res = [
    "",
    " q quit | l view commit diff",
    " o checkout | r rebase",
    "",
    " ❯ 123fab0 - commit msg (2 hours ago) <author>",
    "",
    "",
  ].join("\n")

  t.truthy(write.calledWith(res))
})

test.serial("should get data", async t => {
  const gitLog = sinon.stub(gu, "gitLog")
  const isGitRepo = sinon.stub(gu, "isGitRepo")

  gitLog.resolves("123fab0 - commit msg (2 hours ago) <author>\n")

  await getData()

  t.truthy(isGitRepo.called)
  t.truthy(gitLog.called)

  gitLog.restore()
  isGitRepo.restore()
})
