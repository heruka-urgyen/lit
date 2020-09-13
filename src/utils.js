import chalk from "chalk"
import ansiToJson from "ansi-to-json"
import colorize from "ink/build/colorize"

const last = xs => xs[xs.length - 1]
export const statusStrToList = str => str
  .split(/[\r\n]+/).slice(0, -1)
  .sort((x, y) => last(x.split(" ")) < last(y.split(" ")) ? 1 : -1)

export const calculateListView = (items, viewSize, selectedItem) => {
  if (items.length <= viewSize) {
    return {items, selected: selectedItem}
  }

  const nextWindow = Math.round(viewSize / 2)

  if (selectedItem + nextWindow >= items.length) {
    return {items: items.slice(-viewSize), selected: viewSize - items.length + selectedItem}
  }

  if (selectedItem - nextWindow < 0) {
    return {items: items.slice(0, viewSize), selected: selectedItem}
  }

  return {
    items: items.slice(1 + selectedItem - nextWindow, selectedItem + nextWindow),
    selected: nextWindow - 1,
  }
}

export const createReducer = handlers => (state, action) => {
  // eslint-disable-next-line
  if (handlers.hasOwnProperty(action.type)) {
    return handlers[action.type](state, action)
  }

  return state
}

export const dispatchAction = dispatch => type => payload => dispatch({type, payload})

// from https://stackoverflow.com/a/57298115
export const combineReducers = slices => (prevState, action) => Object.keys(slices).reduce(
  (nextState, nextProp) => ({
    ...nextState,
    [nextProp]: slices[nextProp](prevState[nextProp], action),
  }),
  prevState,
)

export const delay = (n = 100) => new Promise(r => setTimeout(r, n))

export const pipe = (x, y) => new Promise((res, rej) => {
  if (!y) { res(x) }

  let result = ""

  y.stderr.on("data", rej)
  y.stdout.on("data", data => { result = result + data.toString() })
  y.stdout.on("close", () => { res(result) })

  x.then(data => {
    y.stdin.write(data)
    y.stdin.end()
  }).catch(rej)
})

export const setBgColor = color => str => {
  const chunks = ansiToJson(str)
  const set = x => (str, color) => colorize(str, color, x)
  const setFg = set("foreground")
  const setBg = set("background")

  return chunks.map(
    c => setFg(setBg(chalk.bold(c.content), color), `rgb(${c.fg})`),
  ).join("")
}

export const identity = _ => _

const applyHorizonralMargin = m => "\n".repeat(m)
const applyVerticalMargin = m => " ".repeat(m)
const renderHintItem = o => `${o.keys.map(k => o.style(k)).join(" ")} ${o.hint}`
const renderHintLine = l => l.map(renderHintItem).join(" | ")
const box = style => lines => {
  const {marginLeft = 0, marginTop = 0, marginRight = 0, marginBottom = 0} = style
  const [ml, mr] = [marginLeft, marginRight].map(applyVerticalMargin)
  const [mt, mb] = [marginTop, marginBottom].map(applyHorizonralMargin)

  return (mt + lines.map(l => ml + renderHintLine(l) + mr).join("\n") + mb)
}

export const renderHint = box
export const getActions = handlers => dispatch => Object.keys(handlers).reduce(
  (acc, x) => ({...acc, [x]: dispatchAction(dispatch)(x)}), {},
)
