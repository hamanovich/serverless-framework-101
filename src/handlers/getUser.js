const AWS = require("aws-sdk");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");
const httpErrorHandler = require("@middy/http-error-handler");
const createError = require("http-errors");

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUser(event) {
  let user;
  const { id } = event.pathParameters;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    user = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!user) {
    throw new createError.NotFound(`User with ID "${id}" not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

module.exports.handler = middy(getUser)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
