const AWS = require('aws-sdk')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

const errorMessage = require('./utils/error')
const stream = require('./utils/stream')

class S3 {
  constructor({ region, bucketName }) {
    if (process.env.AWS_PROFILE) {
      const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
      AWS.config.credentials = credentials;
    }
    this.s3Client = new AWS.S3({ region, apiVersion: '2006-03-01' })
    this.bucketName = bucketName
    this.s3Clientv3 = new S3Client({ region })
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
        if (error) console.error(errorMessage({ source: S3.name, error, method: 'putJSON', item })) // an error occurred
        resolve(data)
      })
    })
    return data
  }

  async putJSONv2({ key, item }) {
    const params = {
      Body: JSON.stringify(item),
      Bucket: this.bucketName,
      Key: `${key.replace('/', '-')}.json`,
      ContentType: 'application/json'
    }
    try {
      const results = await this.s3Clientv3.send(new PutObjectCommand(params))
      console.log(
        "Successfully created " +
        params.Key +
        " and uploaded it to " +
        params.Bucket +
        "/" +
        params.Key
      );
      return results
    } catch (error) {
      console.error(errorMessage({ source: S3.name, error, method: 'putJSON', item })) // an error occurred
    }
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
          console.error(errorMessage({ source: S3.name, error, method: 'getJSON' })) // an error occurred
        }
        resolve(data)
      })
    })
    return data
  }

  async getJSONv2({ key }) {
    const formattedKey = key.replace('/', '-')
    const params = {
      Bucket: this.bucketName,
      Key: `${formattedKey}.json`
    }
    try {
      const results = await this.s3Clientv3.send(new GetObjectCommand(params))
      const rawData = await stream(results.Body)
      return JSON.parse(rawData)

    } catch (error) {
      console.error(errorMessage({ source: S3.name, error, method: 'getJSON' })) // an error occurred
    }
  }

  async putCSV({ key, item }) {
    const params = {
      Body: item,
      Bucket: this.bucketName,
      Key: `${key.replace('/', '-')}.csv`,
      ContentType: 'text/csv'
    }
    const data = await new Promise(resolve => {
      return this.s3Client.putObject(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3.name, error, method: 'putCSV', item })) // an error occurred
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

  async listObjects() {
    const params = {
      Bucket: this.bucketName
    }
    const data = await new Promise(resolve => {
      return this.s3Client.listObjects(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3.name, error, method: 'listObjects' })) // an error occurred
        resolve(data)
      })
    })
    return data.Contents
  }


  async clearBucket() {
    const allObjects = await this.listObjects()

    if (!allObjects || allObjects.length === 0) {
      console.log(`[${this.bucketName}] Bucket Contents Empty`);
      return {}
    }

    const params = {
      Bucket: this.bucketName,
      Delete: {
        Objects: allObjects.map(obj => ({ Key: obj.Key })),
        Quiet: false
      }
    }

    await new Promise(resolve => {
      return this.s3Client.deleteObjects(params, (error, data) => {
        if (error) console.error(errorMessage({ source: S3.name, error, method: 'deleteObjects' })) // an error occurred
        resolve(data)
      })
    })

    return this.clearBucket()
  }
}

module.exports = S3
