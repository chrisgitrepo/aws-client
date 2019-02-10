const DynamoClient = require('../src/DynamoClient')
const data = require('../__mocks__/data')
const errorMessage = require('../src/utils/error')

const testSuite = 'DynamoClient'
const region = 'test-region'
const tableName = 'test-table-name'

describe(testSuite, () => {
  test('should create a docClient using the region and tableName passed into the constructor', () => {
    const dynamoClient = new DynamoClient({ region, tableName })

    expect(dynamoClient.docClient).toBeTruthy()
    expect(dynamoClient.tableName).toBe(tableName)
  })

  describe('get', () => {
    test('should get data from aws-sdk', () => {
      const { get: { Item }, Key: { id } } = data
      const dynamoClient = new DynamoClient({ region, tableName })
  
      return dynamoClient.get({ id }).then((data) => {
        expect(data).toBe(Item)
      })
    })

    test('should error properly', () => {
      const id = 'none existent'
      const expected = errorMessage({ source: testSuite, error: data.error, method: 'get', item: id })
      const dynamoClient = new DynamoClient({ region, tableName })
  
      return dynamoClient.get({ id }).then((data) => {
        expect(data).toBe(expected)
      })
    })
  })
})