// const AWS = require('aws-sdk')

// class SNSClient {

//   constructor({ region, topicArn }) {
//     if (process.env.AWS_PROFILE) {
//       const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
//       AWS.config.credentials = credentials;
//     }
//     this.snsClient = new AWS.SNS({
//       region,
//       apiVersion: '2010-03-31'
//     })
//     this.topicArn = topicArn
//   }

//   static extractMessage(event) {
//     const { Records: [{ Sns: { Message } }] } = event
//     let parsedMsg = undefined
//     try {
//       parsedMsg = JSON.parse(Message)
//     } catch (error) {
//     }
//     return parsedMsg
//   }

//   async publish({ message }) {
//     const params = {
//       Message: message,
//       TopicArn: this.topicArn
//     }

//     const data = await new Promise(resolve => {
//       return this.snsClient.publish(params, (err, data) => {
//         if (err) console.error(err, err.stack)
//         else resolve(data)           // successful response
//       })
//     })
//     return data
//   }
// }

// module.exports = SNSClient
