const data = require('./data')

const tableName = 'test-table-name'

const AWS = {
  DynamoDB: {
  }
}

AWS.DynamoDB.DocumentClient = class {
  constructor({ region, apiVersion }) {
    this.region = region
    this.apiVersion = apiVersion
  }

  get(params, callback) {
    const { Key: { id }, get: { Item }, error } = data
    if (params.Key.id !== id) return callback(error, null)
    return callback(null, { Item })
  }

  batchGet(params, callback) {
    const { keys, batchGet: { Items }, error } = data
    // if (params.RequestItems.Keys.ids !== ids) return callback(error, null)
    return callback(null, { Responses: { [tableName]: Items } })
  }
}

module.exports = AWS