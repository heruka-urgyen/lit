import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"
import {calculateListView} from "utils"
import Selector from "./Selector"

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
