import {testProp, fc} from "ava-fast-check"

import {handlers} from "reducers/status"

testProp("should select item", [fc.nat(), fc.nat()], (t, item1, item2) => {
  const res1 = handlers.selectItem({selected: item1}, {payload: i => i + item2})
  const res2 = handlers.selectItem({selected: item1}, {payload: i => i - item2})
  const res3 = handlers.selectItem({selected: item1}, {payload: _ => item2})

  t.is(res1.selected, item1 + item2)
  t.is(res2.selected, item1 - item2)
  t.is(res3.selected, item2)
})

testProp("should select all", [fc.boolean()], (t, allSelected) => {
  const res = handlers.toggleSelectAll({allSelected})

  t.is(res.allSelected, !allSelected)
})

testProp("should set log", [fc.base64String(), fc.base64String()], (t, l1, l2) => {
  const res = handlers.setLog({log: l1}, {payload: l2})

  t.is(res.log, l2)
})

testProp("should set files", [fc.base64String(), fc.base64String()], (t, s1, s2) => {
  const files1 = s1.split(/./)
  const files2 = s2.split(/./)
  const res = handlers.setFiles({files: files1}, {payload: files2})

  t.deepEqual(res.files, files2)
})
