const AWS = require('aws-sdk')

const errorMessage = require('./utils/error')

class S3Client {

  constructor({ region, bucketName }) {
    if (process.env.AWS_PROFILE) {
      const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
      AWS.config.credentials = credentials;
    }
    this.s3Client = new AWS.S3({ region, apiVersion: '2006-03-01' })
    this.bucketName = bucketName
  }

  async putJSON({ key, item }) {
    const params = {
      Body: JSON.stringify(item),
      Bucket: this.bucketName,
      Key: `${key.replace('/', '-')}.json`,
      ContentType: 'application/json'
    }
    const data = await new Promise(resolve => {
      return this.s3Client.putObject(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3Client.name, error, method: 'putJSON', item })) // an error occurred
        resolve(data)
      })
    })
    return data
  }

  async getJSON({ key }) {
    const params = {
      Bucket: this.bucketName,
      Key: `${key.replace('/', '-')}.json`
    }
    const data = await new Promise(resolve => {
      return this.s3Client.getObject(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3Client.name, error, method: 'getJSON' })) // an error occurred
        resolve(data)
      })
    })
    return data
  }

  async getObject({ filepath, filetype }) {
    const params = {
      Bucket: this.bucketName,
      Key: `${filepath}.${filetype}`
    }
    const data = await new Promise(resolve => {
      return this.s3Client.getObject(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3Client.name, error, method: 'getObject' })) // an error occurred
        resolve(data)
      })
    })
    return data
  }
}

module.exports = S3Client
