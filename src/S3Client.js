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
    const formattedKey = key.replace('/', '-')
    const params = {
      Bucket: this.bucketName,
      Key: `${formattedKey}.json`
    }
    const data = await new Promise(resolve => {
      return this.s3Client.getObject(params, (error, data) => {
        if (error) {
          if (error.message === 'The specified key does not exist.') {
            console.log(`[${formattedKey}] - ${error.message} Returning empty array...`);
            return resolve([])
          }
          console.error(errorMessage({ source: S3Client.name, error, method: 'getJSON' })) // an error occurred
        }
        resolve(data)
      })
    })
    return data
  }

  getObjectStream({ filepath, filetype }) {
    const params = {
      Bucket: this.bucketName,
      Key: `${filepath}.${filetype}`
    }
    return this.s3Client.getObject(params).createReadStream();
  }
}

module.exports = S3Client
