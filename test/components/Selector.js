import test from "ava"

import Selector from "components/Selector"

test("should show selected indicator when item selected", t => {
  const r = Selector({isSelected: true, el: "el"})
  t.deepEqual(r, " ❯ el")
})

test("should not show selected indicator when item not selected", t => {
  const r = Selector({isSelected: false, el: "el"})
  t.deepEqual(r, "   el")
})
