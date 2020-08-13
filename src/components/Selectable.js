import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"
import Selector from "./Selector"

const calculateListView = (items, viewSize, selectedItem) => {
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

export default function Selectable({data, selected, maxHeight}) {
  const {items, selected: selectedItem} = calculateListView(data, maxHeight, selected)

  return (
    <Box maxHeight={maxHeight} flexDirection="column">
      {items.map((x, i) => (
        <Text key={x} wrap="truncate">
          <Selector isSelected={selectedItem === i} el={x} />
        </Text>
      ))}
    </Box>
  )
}

Selectable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
}
