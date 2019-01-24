# aws-client
Minimalist Node.js client for AWS services

Currently Supports:

 * **DynamoDB** (get, batchGet, put, batchPut, query) - *DynamoClient*
 * **SNS** (publish) - *SNSClient*

# Installation

`npm install aws-client`

# Import

You can import one or many clients depending on what you need:

ES6 Import:

`import { DynamoClient, SNSClient } from 'aws-client'`

CommonJS:

`const { DynamoClient, SNSClient } = require('aws-client')`

# Usage

```
const client = new DynamoClient({
  region: 'eu-west-1',
  tableName: 'users-prod'
})

const getUser = async (id) => {
  const data = await client.get({ id })
  console.log(data)
}

getUser('fred')
```
If there is a DynamoDB table called *users-prod* in your AWS account containing an item with the primary key (id) of 'fred', the above code will print it to the console.  