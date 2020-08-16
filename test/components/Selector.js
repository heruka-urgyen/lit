import test from "ava"

import Selector from "components/Selector"

test("selected", t => {
  const r = Selector({isSelected: true, el: "el"})
  t.deepEqual(r, " ❯ el")
})

test("not selected", t => {
  const r = Selector({isSelected: false, el: "el"})
  t.deepEqual(r, "   el")
})
