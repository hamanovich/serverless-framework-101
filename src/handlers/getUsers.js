const AWS = require("aws-sdk");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");
const httpErrorHandler = require("@middy/http-error-handler");
const createError = require("http-errors");

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUsers() {
  let users;

  try {
    const result = await dynamodb
      .scan({
        TableName: process.env.USERS_TABLE_NAME,
      })
      .promise();

    users = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
}

module.exports.handler = middy(getUsers)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
