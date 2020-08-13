import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"
import Selector from "./Selector"

export default function Selectable({data, selected}) {
  return (
    <Box flexDirection="column">
      {data.map((x, i) => (
        <Text key={x} wrap="truncate">
          <Selector isSelected={selected === i} el={x} />
        </Text>
      ))}
    </Box>
  )
}

Selectable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.number.isRequired,
}
