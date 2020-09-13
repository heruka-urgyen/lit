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

  const {data, selected} = state.log
  const {selectLogItem} = actions

  return (
    <Box>
      <Selectable
        minHeight={minHeight}
        maxHeight={maxHeight}
        data={data}
        selected={selected}
        selectItem={selectLogItem}
      />
    </Box>
  )
}

const {shape, arrayOf, number, string, func} = PropTypes

Log.propTypes = {
  state: shape({
    log: shape({
      data: arrayOf(string).isRequired,
      selected: number.isRequired,
    }).isRequired,
  }).isRequired,
  actions: shape({
    selectLogItem: func.isRequired,
  }).isRequired,
  minHeight: number.isRequired,
  maxHeight: number.isRequired,
}
