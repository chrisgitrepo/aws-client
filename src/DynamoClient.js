const AWS = require('aws-sdk')
const R = require('ramda')

const errorMessage = require('./utils/error')

class DynamoClient {
  
  constructor({ region, tableName }) {
    this.docClient = new AWS.DynamoDB.DocumentClient({
      region,
      apiVersion: '2012-08-10'
    })
    this.tableName = tableName
  }

  async get({ id }) {
    const params = {
      TableName : this.tableName,
      Key: { id }
    }

    const data = await new Promise(resolve => {
      return this.docClient.get(params, (error, data) => {
        if (error) resolve(errorMessage({ source: DynamoClient.name, error, method: 'get', item: id }))
        resolve(data.Item)
      })
    })
    return data
  }

  async batchGet({ keyName, keys }) {
    const formattedIds = keys.map(key => ({ [keyName]: key }))
    const chunkedIds = R.splitEvery(100, formattedIds)

    const data = []
    for (const chunk of chunkedIds) {
      const params = {
        RequestItems: {
          [this.tableName]: {
            Keys: chunk
          }
        }
      }
      const response = await new Promise(resolve => {
        return this.docClient.batchGet(params, (error, data) => {
          if (error) resolve(errorMessage({ source: DynamoClient.name, error, method: 'batchGet', item: chunk }))
          else resolve(data.Responses[this.tableName])
        })
      })
      data.push(response)
    }
    const flattenedData = [].concat(...data)
    return flattenedData
  }

  async put({ item }) {
    const params = {
      TableName: this.tableName,
      Item: item
    }
    const data = await new Promise(resolve => {
      return this.docClient.put(params, (error, data) => {
        if (error) console.error(errorMessage({ source: DynamoClient.name, error, method: 'put', item })) // an error occurred
        resolve(data)
      })
    })
    return data
  }

  async batchPut({ items }) {
    const chunkedData = R.splitEvery(25, items)

    for (const chunk of chunkedData) {
      const params = {
        RequestItems: {
          [this.tableName]: chunk.map(obj => (
            {
              PutRequest: {
                Item: obj
              }
            }
          ))
        }
      }
      const data = await new Promise(resolve => {
        return this.docClient.batchWrite(params, (error, data) => {
          if (error) console.error(errorMessage({ source: DynamoClient.name, error, method: 'batchPut', items })) // an error occurred
          resolve(data)
        })
      })
      return data
    }
  }

  async query({ indexName, keyName, keyValue, sortKey, sortOperator, sortValue, showColumns }) {
    const KeyConditionExpression = `${keyName} = :keyValue`
    const ExpressionAttributeValues = { ':keyValue': keyValue }

    const params = {
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression,
      ExpressionAttributeValues,
    }

    if (sortKey && sortOperator && sortValue) {
      let hashedSortKey = sortKey
      if (sortKey === 'timestamp') {
        hashedSortKey = `#${sortKey}`
        params.ExpressionAttributeNames = { [hashedSortKey]: sortKey }
      }
      params.KeyConditionExpression = `${KeyConditionExpression} and ${hashedSortKey} ${sortOperator} :sortValue`
      params.ExpressionAttributeValues[':sortValue'] = sortValue
    }

    if (showColumns) {
      params.ProjectionExpression = showColumns
    }

    const data = await new Promise(resolve => {
      return this.docClient.query(params, (error, data) => {
        if (error) console.log(error)
        else resolve(data.Items)
      })
    })
    return data
  }

  async update({ id, update }) {
    const params = {
      TableName : this.tableName,
      Key: { id },
      AttributeUpdates: update
    }

    const data = await new Promise(resolve => {
      return this.docClient.update(params, (error, data) => {
        if (error) resolve(errorMessage({ source: DynamoClient.name, error, method: 'update', item: id }))
        resolve(data)
      })
    })
    return data
  }
}

module.exports = DynamoClient
