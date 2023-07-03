const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3')

const errorMessage = require('./utils/error')
const stream = require('./utils/stream')

class S3 {
  constructor({ region, bucketName }) {
    this.bucketName = bucketName
    this.s3Clientv3 = new S3Client({ region })
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
      return results
    } catch (error) {
      console.error(errorMessage({ source: S3.name, error, method: 'putJSON', item })) // an error occurred
    }
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
      if (error.message !== 'The specified key does not exist.') {
        console.error(errorMessage({ source: S3.name, error, method: 'getJSON' })) // an error occurred
      }
      return null
    }
  }

  async getObjectStreamv2({ filepath, filetype }) {
    const params = {
      Bucket: this.bucketName,
      Key: `${filepath}.${filetype}`
    }
    const results = await this.s3Clientv3.send(new GetObjectCommand(params))

    return results.Body
  }

  async listObjectsv2({ maxKeys, prefix }) {
    const params = {
      Bucket: this.bucketName,
      MaxKeys: maxKeys,
      Prefix: prefix,
    }
    try {
      const results = await this.s3Clientv3.send(new ListObjectsCommand(params))
      return results.Contents
    } catch (error) {
      console.error(errorMessage({ source: S3.name, error, method: 'listObjects' })) // an error occurred
    }
  }

  async clearBucketv2() {
    const allObjects = await this.listObjectsv2()

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

    try {
      await this.s3Clientv3.send(new DeleteObjectsCommand(params))

    } catch (error) {
      console.error(errorMessage({ source: S3.name, error, method: 'deleteObjects' })) // an error occurred
    }

    return this.clearBucketv2()
  }
}

module.exports = S3
