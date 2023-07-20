import 'source-map-support/register'
import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS);
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodoAttachmentUrl } from '../../helpers/todosAcess'
import { getUserId } from '../utils';

//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
const s3bucketname = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({ signatureVersion: 'v4' })

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    console.log(todoId)
    const attachmentUrl = `https://${s3bucketname}.s3.amazonaws.com/${todoId}`
    const s3UploadUrl =  s3.getSignedUrl('putObject', {
      Bucket: s3bucketname,
      Key: todoId,
      Expires: parseInt(urlExpiration ? urlExpiration : '300')
    });
    await updateTodoAttachmentUrl(getUserId(event),todoId,attachmentUrl)
    // return attachmentUtils.getUploadUrl(todoId);
    // return uploadUrl;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: s3UploadUrl
      })
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
