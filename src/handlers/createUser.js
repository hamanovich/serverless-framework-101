const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");
const httpErrorHandler = require("@middy/http-error-handler");
const createError = require("http-errors");

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createUser(event) {
  const { email } = event.body;
  const now = new Date();

  const user = {
    id: uuidv4(),
    email,
    status: "NOT_VERIFIED",
    createdAt: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.USERS_TABLE_NAME,
        Item: user,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

module.exports.handler = middy(createUser)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
