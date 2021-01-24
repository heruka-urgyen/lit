import test from "ava"
import {testProp, fc} from "ava-fast-check"
import sinon from "sinon"
import {statusStrToList, calculateListView, pipe} from "utils"

test("should map status str to list", t => {
  const s1 = "1 .M 123\n"
  const s2 = "1 .M filename\n? filename2\n1 .M filename3\n"
  const s3 = "1 .M filename\n? filename2\n"

  const l1 = [" M 123"]
  const l2 = [" M filename", "?? filename2", " M filename3"]
  const l3 = [" M filename", "?? filename2"]

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

testProp("should pipe commands", [fc.base64String()], async (t, string) => {
  const inWriteSpy = sinon.spy()
  const inEndSpy = sinon.spy()
  const errSpy = sinon.spy()

  const cmd1 = new Promise(r => r(string))
  const cmd2 = {
    stdin: {
      write: inWriteSpy,
      end: inEndSpy,
    },
    stderr: {
      on: errSpy,
    },
    stdout: {
      on: (x, f) => {
        if (x === "data") {
          f(string)
        }

        if (x === "close") {
          f()
        }
      },
    },
  }

  const res1 = await pipe(cmd1)
  const res2 = await pipe(cmd1, cmd2)

  t.deepEqual(res1, await cmd1)
  t.truthy(inWriteSpy.calledWith(string))
  t.truthy(inEndSpy.called)
  t.truthy(errSpy.called)
  t.deepEqual(res2, string)
})
