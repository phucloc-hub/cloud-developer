import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess');
const docClient: DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.TODOS_CREATED_AT_INDEX
// // TODO: Implement the dataLayer logic
export async function createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Create todo');
  
    await docClient.put({
        TableName: todosTable,
        Item: todo
      }).promise()
  
      return todo
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('getTodosForUser '+userId);

    const result = await docClient
      .query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();

    return result.Items as TodoItem[];
}

export async function getTodoById(todoId: string): Promise<TodoItem> {
    logger.info('getTodoById '+todoId);

    const result = await docClient
      .query({
        TableName: todosTable,
        IndexName: indexName,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise();
    
      if(result.Items.length !== 0) return result.Items[0] as TodoItem

    return null
}

export async function updateTodoAttachmentUrl(userId: string,todoId: string,attachmentUrl: string): Promise<TodoItem> {
    console.log('updateTodoAttachmentUrl');

    const result = await docClient.update(
        {
            TableName: todosTable,
            Key: {
              userId: userId,
              todoId: todoId
            },
            UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: {
              '#attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl
            },
            ReturnValues: 'ALL_NEW'
        }
    ).promise();
    const item = result.Attributes;
    return item as TodoItem
  }

export async function searchTodos(userId: string, keyword: string): Promise<TodoItem[]> {
    console.log('searchTodos for user ', userId, ' by name ', keyword);

    const result = await docClient
      .query({
        TableName: todosTable,
        KeyConditionExpression: '#userId =:i',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':i': userId
        }
      })
      .promise();

    let items = result.Items;
    items = items.filter((item) => item.name.includes(keyword));
    return items as TodoItem[];
}

export async function updateTodoByUserIdAndTodoId(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest): Promise<UpdateTodoRequest> {
    logger.info('updateTodoByUserIdAndTodoId userId='+userId +', todoId='+todoId);
      const result = await docClient.update(
        {
            TableName: todosTable,
            Key: {
              userId,
              todoId
            },
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
              '#name': 'name',
              '#dueDate': 'dueDate',
              '#done': 'done'
            },
            ExpressionAttributeValues: {
              ':name': updateTodoRequest.name,
              ':dueDate': updateTodoRequest.dueDate,
              ':done': updateTodoRequest.done
            },
            ReturnValues: 'ALL_NEW'
          }
      ).promise();
    return result.Attributes as TodoItem
}

function createDynamoDBClient() {
    logger.info('createDynamoDBClient');
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  
export async function deleteTodoByUserIdWithTodoId(
    userId: string,
    todoId: string
  ): Promise<TodoItem> {
    logger.info('deleteTodoByUserIdWithTodoId');
    const result = await docClient.delete(
        {
            TableName: todosTable,
            Key: {
              userId,
              todoId
            }
        }
    ).promise();
    // of Delete Func
    logger.info('deleteTodoByUserIdWithTodoId END');
    return result.Attributes as TodoItem
}