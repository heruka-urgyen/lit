/* eslint-disable import/prefer-default-export */

export const statusStrToList = str => str.split("\n").slice(0, -1)

export const calculateListView = (items, viewSize, selectedItem) => {
  if (items.length <= viewSize) {
    return {items, selected: selectedItem}
  }

  const nextWindow = (viewSize / 2) - ((viewSize / 2) % 1)

  if (selectedItem + nextWindow >= items.length) {
    return {items: items.slice(-viewSize), selected: viewSize - items.length + selectedItem}
  }

  if (selectedItem - nextWindow < 0) {
    return {items: items.slice(0, viewSize), selected: selectedItem}
  }

  return {
    items: items.slice(selectedItem - nextWindow, selectedItem + nextWindow),
    selected: nextWindow,
  }
}

export const createReducer = handlers => (state, action) => {
  // eslint-disable-next-line
  if (handlers.hasOwnProperty(action.type)) {
    return handlers[action.type](state, action)
  }

  return state
}
