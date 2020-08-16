import test from "ava"
import {statusStrToList} from "utils"

test.serial("statusStrToList", t => {
  t.deepEqual(statusStrToList("123\n"), ["123"])
})
