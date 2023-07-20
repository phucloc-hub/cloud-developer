// import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
// import * as createError from 'http-errors'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils';
import { TodoItem } from '../models/TodoItem';
import { createTodo } from './todosAcess';
// // TODO: Implement businessLogic
export async function todoCreating(req: CreateTodoRequest, event: APIGatewayProxyEvent): Promise<TodoItem> {
    const userId = getUserId(event)
    const itemId = uuid.v4()
    const newItem = {
      todoId: itemId,
      userId: userId,
      done: false,
      createdAt: new Date().toISOString(),
      // attachmentUrl: '',
      ...req
    }
    return await createTodo(newItem);
}