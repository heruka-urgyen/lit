import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"
import {calculateListView} from "utils"
import {selectedBackground} from "colors"
import Selector from "./Selector"

export default function Selectable({data, selected, minHeight, maxHeight, allSelected}) {
  const {items, selected: selectedItem} = calculateListView(data, maxHeight, selected)

  return (
    <Box minHeight={minHeight} maxHeight={maxHeight} flexDirection="column">
      {items.map((x, i) => (
        <Text key={x} wrap="truncate">
          <Selector
            isSelected={allSelected || selectedItem === i}
            backgroundColor={selectedBackground}
            el={x}
          />
        </Text>
      ))}
    </Box>
  )
}

Selectable.defaultProps = {
  allSelected: false,
}

Selectable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.number.isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  allSelected: PropTypes.bool,
}
