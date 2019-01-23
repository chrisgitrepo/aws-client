const AWS = require('aws-sdk')
const R = require('ramda')

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

const errorMessage = ({ err, method, item }) => `ERROR in DynamoClient ${method}\nStack: ${err.stack}\nItem(s): ${JSON.stringify(item)}`

class DynamoClient {

  constructor({ region, tableName }) {
    AWS.config.update({ region })
    this.tableName = tableName
  }

  async get({ id }) {
    const params = {
      TableName : this.tableName,
      Key: { id }
    }

    const data = await new Promise(resolve => {
      return docClient.get(params, (err, data) => {
        if (err) console.error(errorMessage({ err, method: 'get', item: id })) // an error occurred
        resolve(data.Item)
      })
    })
    return data
  }

  async batchGet({ ids }) {
    const chunkedIds = R.splitEvery(100, ids)

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
        return docClient.batchGet(params, (err, data) => {
          if (err) console.error(errorMessage({ err, method: 'batchGet', item: ids }))
          else resolve(data.Responses[tableName])
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
      return docClient.put(params, (err, data) => {
        if (err) console.error(errorMessage({ err, method: 'put', item })) // an error occurred
        resolve(data)
      })
    })
    return data
  }

  async batchPut({ data }) {
    const chunkedData = R.splitEvery(25, data)

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
      await docClient.batchWrite(params, (err, data) => {
        if (err) console.error(errorMessage({ err, method: 'batchPut', item: data })) // an error occurred
        return data
      })
    }
  }

  async query({ id, index }) {
    var params = {
      TableName: this.tableName,
      IndexName: index,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    }

    const data = await new Promise(resolve => {
      return docClient.query(params, (err, data) => {
        if (err) console.log(err)
        else resolve(data.Items)
      })
    })
    return data
  }
}

module.exports = DynamoClient
