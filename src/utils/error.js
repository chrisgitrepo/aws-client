const errorMessage = ({ source, error, method, item }) => {
  const errorMsg = `ERROR in '${source}' function: '${method}'\nStack: ${error.stack}\nItem(s): ${item && JSON.stringify(item)}`
  console.error(errorMsg)
  return errorMsg
}

module.exports = errorMessage