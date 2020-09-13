import {testProp, fc} from "ava-fast-check"

import {handlers} from "reducers/log"

testProp("should select item", [fc.nat(), fc.nat()], (t, item1, item2) => {
  const res1 = handlers.selectLogItem({selected: item1}, {payload: i => i + item2})
  const res2 = handlers.selectLogItem({selected: item1}, {payload: i => i - item2})
  const res3 = handlers.selectLogItem({selected: item1}, {payload: _ => item2})

  t.is(res1.selected, item1 + item2)
  t.is(res2.selected, item1 - item2)
  t.is(res3.selected, item2)
})
