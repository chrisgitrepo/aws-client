const AWS = require('aws-sdk')

class SNSClient {
  constructor({ region, topicArn }) {
    this.snsClient = new AWS.SNS({
      region,
      apiVersion: '2010-03-31'
    })
      this.topicArn = topicArn
    }

  async publish({ message }) {
    const params = {
      Message: message,
      TopicArn: this.topicArn
    }

    const data = await new Promise(resolve => {
      return this.snsClient.publish(params, (err, data) => {
        if (err) console.error(err, err.stack)
        else resolve(data)           // successful response
      })
    })
    return data
  }
}

module.exports = SNSClient
