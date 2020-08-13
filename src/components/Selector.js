const SELECTOR = "❯"

export default function Selector({isSelected, el}) {
  return ` ${isSelected ? SELECTOR : " "} ${el}`
}
