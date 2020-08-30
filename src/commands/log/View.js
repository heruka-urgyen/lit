import React from "react"
import PropTypes from "prop-types"
import {Box, useApp, useInput} from "ink"

import Selectable from "components/Selectable"
import {gitCheckout, gitRebase} from "git-utils"
import {parseCommitHash} from "./utils"

export default function Log({state, actions, minHeight, maxHeight}) {
  const {data, selected} = state
  const {selectItem} = actions
  const {exit} = useApp()

  useInput(async (input) => {
    if (input === "q") {
      exit()
    }

    if (input === "o") {
      await gitCheckout([parseCommitHash(data[selected])])
      exit()
    }

    if (input === "r") {
      await gitRebase(["--interactive", parseCommitHash(data[selected])])
      exit()
    }
  })

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
