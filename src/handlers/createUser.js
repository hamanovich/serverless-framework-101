const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createUser(event, context) {
  const { email } = JSON.parse(event.body);
  const now = new Date();

  const user = {
    id: uuidv4(),
    email,
    status: "NOT_VERIFIED",
    createdAt: now.toISOString(),
  };

  await dynamodb
    .put({
      TableName: "usersTable",
      Item: user,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

module.exports.handler = createUser;
