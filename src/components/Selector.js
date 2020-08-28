import {setBgColor} from "utils"

const SELECTOR = "❯"

export default function Selector({isSelected, backgroundColor, el}) {
  if (isSelected) {
    return ` ${SELECTOR} ${setBgColor(backgroundColor)(el)}`
  }

  return `   ${el}`
}
