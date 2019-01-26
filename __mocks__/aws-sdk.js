const data = require('./data')

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
}

module.exports = AWS