import test from "ava"
import React from "react"
import {render} from "ink-testing-library"
import sinon from "sinon"

import Layout from "commands/diff/Layout"
import * as g from "git-utils"

const delay = (n = 100) => new Promise(r => setTimeout(r, n))

const gitUtilsStub = sinon.stub(g)

test("render Layout", async t => {
  gitUtilsStub.gitStatusPorcelain.onCall(0).resolves("1 .M zbc\n")
  gitUtilsStub.gitDiff.onCall(0).resolves("@@ +0,7 -0,0 @@\n+ preview")

  gitUtilsStub.gitStatusPorcelain.onCall(1).resolves("1 A. xcv\n")
  gitUtilsStub.gitDiff.onCall(1).resolves("@@ +0,8 -0,0 @@\n+ preview2")

  gitUtilsStub.gitStatusPorcelain.onCall(2).resolves("? rty\n")
  gitUtilsStub.gitDiff.onCall(2).resolves("@@ +0,9 -0,0 @@\n+ preview3 ")

  const output = render(
    <Layout
      initialLines={["M zbc", "A xcv", "?? rty"]}
      minHeight={5}
      maxHeight={5}
    />,
  )

  await delay()
  t.truthy(output.lastFrame().indexOf(" ❯ M zbc") > -1)
  t.truthy(output.lastFrame().indexOf("   A xcv") > -1)
  t.truthy(output.lastFrame().indexOf("   ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,7 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview") > -1)

  output.stdin.write("j")
  await delay()
  t.truthy(output.lastFrame().indexOf("   M zbc") > -1)
  t.truthy(output.lastFrame().indexOf(" ❯ A xcv") > -1)
  t.truthy(output.lastFrame().indexOf("   ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,8 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview2") > -1)

  output.stdin.write("j")
  await delay()
  t.truthy(output.lastFrame().indexOf("   M zbc") > -1)
  t.truthy(output.lastFrame().indexOf("   A xcv") > -1)
  t.truthy(output.lastFrame().indexOf(" ❯ ?? rty") > -1)
  t.truthy(output.lastFrame().indexOf("@@ +0,9 -0,0 @@") > -1)
  t.truthy(output.lastFrame().indexOf("+ preview3 ") > -1)
})
