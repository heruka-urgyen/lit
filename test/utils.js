import test from "ava"
import {statusStrToList, calculateListView} from "utils"

test.serial("statusStrToList", t => {
  t.deepEqual(statusStrToList("123\r\n"), ["123"])
})

test.serial("calculateListView all items fit in view", t => {
  const items = [1, 2, 3, 4, 5]
  const r = calculateListView(items, 7, 0)

  t.deepEqual(r, {items, selected: 0})
})

test.serial("calculateListView selected item near end of list", t => {
  const items = [1, 2, 3, 4, 5]
  const r = calculateListView(items, 4, 3)

  t.deepEqual(r, {items: [2, 3, 4, 5], selected: 2})
})

test.serial("calculateListView selected item near beginning of list", t => {
  const items = [1, 2, 3, 4, 5]
  const r = calculateListView(items, 4, 1)

  t.deepEqual(r, {items: [1, 2, 3, 4], selected: 1})
})

test.serial("calculateListView selected item in the end of list", t => {
  const items = [1, 2, 3, 4, 5]
  const r = calculateListView(items, 3, 4)

  t.deepEqual(r, {items: [3, 4, 5], selected: 2})
})
