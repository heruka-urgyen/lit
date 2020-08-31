import React from "react"
import PropTypes from "prop-types"
import {Box} from "ink"
import Selectable from "components/Selectable"

export default function Log(props) {
  const {
    minHeight,
    maxHeight,
    actions,
    state,
  } = props

  const {data, selected} = state
  const {selectItem} = actions

  return (
    <Box>
      <Selectable
        minHeight={minHeight}
        maxHeight={maxHeight}
        data={data}
        selected={selected}
        selectItem={selectItem}
      />
    </Box>
  )
}

Log.propTypes = {
  state: PropTypes.shape({
    selected: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    selectItem: PropTypes.func.isRequired,
  }).isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
}
