const DynamoClient = require('./DynamoClient')
const SNSClient = require('./SNSClient')
const SES = require('./SES')
const S3Client = require('./S3Client')

module.exports = {
  DynamoClient,
  SNSClient,
  SES,
  S3Client
}