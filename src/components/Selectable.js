import React, {useState, useEffect} from "react"
import PropTypes from "prop-types"
import {Box, Text, useInput} from "ink"
import {calculateListView, identity} from "utils"
import {selectedBackground} from "colors"
import Selector from "./Selector"

const selectDown = items => i => (i + 1) % items.length
const selectUp = items => i => i > 0 ? i - 1 : items.length - 1

export default function Selectable(props) {
  const {data, selectItem, selected, minHeight, maxHeight, allSelected} = props
  const [timesPressed, press] = useState(0)
  const {items, selected: selectedItem} = calculateListView(data, maxHeight, selected)

  useEffect(() => {
    const t = setTimeout(() => press(0), 500)

    return () => clearTimeout(t)
  })

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      selectItem(selectDown(data))
    }

    if (input === "k" || key.upArrow) {
      selectItem(selectUp(data))
    }

    if (input === "G" && key.shift) {
      selectItem(_ => data.length - 1)
    }

    if (input === "g") {
      const p = timesPressed + 1
      press(p)

      if (p > 1) {
        selectItem(_ => 0)
      }
    }
  })

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
  selectItem: identity,
}

Selectable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.number.isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  allSelected: PropTypes.bool,
  selectItem: PropTypes.func,
}
