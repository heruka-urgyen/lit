/* eslint-disable import/prefer-default-export */

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
