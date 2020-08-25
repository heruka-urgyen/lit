import React from "react"
import PropTypes from "prop-types"
import {Box, Text} from "ink"
import stripAnsi from "strip-ansi"

export const calculatePreviewWindow = (preview, width, height, position) => {
  const items = preview.slice(position, position + height - 2)
  const wrappedLength = items.filter(x => stripAnsi(x).length > (width - 2)).length

  if (wrappedLength > 0) {
    return items.slice(0, -wrappedLength)
  }

  return items
}

export default function Preview({preview, width, height, previewPosition}) {
  const data = preview.split("\n")
  const items = calculatePreviewWindow(data, width, height, previewPosition)

  return (
    <Box>
      <Text>
        {items.join("\n")}
      </Text>
    </Box>
  )
}

Preview.propTypes = {
  preview: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  previewPosition: PropTypes.number.isRequired,
}
