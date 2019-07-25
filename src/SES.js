const AWS = require('aws-sdk')

const errorMessage = require('./utils/error')

class SES {
  
  constructor({ region }) {
    if (process.env.AWS_PROFILE) {
      const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
      AWS.config.credentials = credentials;
    }
    this.sesClient = new AWS.SES({
      region,
      apiVersion: '2010-12-01'
    })
  }

  async send({ toAddresses, fromAddress, subject, body }) {
    console.log({ toAddresses, fromAddress, subject, body });
    const params = {
      Destination: { ToAddresses: toAddresses },
      Message: {
        Body: {
          Text: {
            Data: body,
          }
        },
        Subject: {
          Data: subject,
        }
      },
      Source: fromAddress,
    }
    const data = await new Promise(resolve => {
      return this.sesClient.sendEmail(params, (error, data) => {
        if (error) resolve(errorMessage({ source: SES.name, error, method: 'send', item: params }))
        resolve(data)
      })
    })
    return data
  }
}

module.exports = SES
