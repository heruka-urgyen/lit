import test from "ava"
import {testProp, fc} from "ava-fast-check"
import {statusStrToList, calculateListView} from "utils"

test("should map status str to list", t => {
  const s1 = "123\r\n"
  const s2 = "M filename\n?? filename2\nM filename3\n"
  const s3 = "M filename\n?? filename2\n"

  const l1 = ["123"]
  const l2 = ["M filename3", "?? filename2", "M filename"]
  const l3 = ["?? filename2", "M filename"]

  t.deepEqual(statusStrToList(s1), l1)
  t.deepEqual(statusStrToList(s2), l2)
  t.deepEqual(statusStrToList(s3), l3)
})

testProp(
  "should fit items in view",
  [
    fc.integer(1, 10000).chain(c => fc.tuple(
      fc.constant(c),
      fc.integer(1, c),
      fc.nat(c - 1),
    )),
  ],
  (t, [listLength, viewLength, selected]) => {
    const items = [...Array(listLength).keys()]
    const r = calculateListView(items, viewLength, selected)

    t.truthy(r.items.length > 0)
    t.truthy(r.items.length <= viewLength)
    t.truthy(r.selected < r.items.length)
    t.deepEqual(r.items[r.selected], items[selected])
  },
)
