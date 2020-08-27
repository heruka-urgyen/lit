import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"

import {calculatePreviewWindow} from "./utils"

export default function Preview({preview, width, height, previewPosition}) {
  const lines = calculatePreviewWindow(preview, width, height, previewPosition)

  if (preview.length === 0) {
    return <Box />
  }

  return (
    <Box flexDirection="column">
      {lines.map(line => (
        <Text key={Math.random().toString()}>
          {line.map(y => (
            <Text
              key={y.id}
              color={y.fg ? `rgb(${y.fg})` : null}
              backgroundColor={y.bg ? `rgb(${y.bg})` : null}
            >
              {y.content}
            </Text>
          ))}
        </Text>
      ))}
    </Box>
  )
}

Preview.propTypes = {
  preview: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  previewPosition: PropTypes.number.isRequired,
}
