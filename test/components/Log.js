import React from "react"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"
import {render} from "ink-testing-library"
import Log from "components/Log"

testProp.serial(
  "should render log",
  [
    fc.integer(1, 1000),
    fc.integer(1, 1000),
  ],
  async (t, minH, maxH) => {
    const commits = [
      "123zxc45 - message (5 days ago) <author>",
      "ab3zxc5t - message2 (1 day ago) <author>",
    ]

    const actions = {selectLogItem: sinon.spy()}
    const state = {log: {data: commits, selected: 0}}

    const output = render(
      <Log
        minHeight={minH}
        maxHeight={maxH}
        actions={actions}
        state={state}
      />,
    )

    t.true(output.lastFrame().indexOf(` ❯ ${commits[0]}`) > -1)
  },
)
