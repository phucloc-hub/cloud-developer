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
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { AttachmentUtils } from './attachmentUtils';
import { createTodo, deleteTodoByUserIdWithTodoId, getTodosForUser, searchTodos, updateTodoAttachmentUrl, updateTodoByUserIdAndTodoId } from './todosAcess';
const attachmentUtils = new AttachmentUtils();

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

export async function getTodosWithUserId(userId: string): Promise<TodoItem[]> {
  return await getTodosForUser(userId);
}


export async function updateTodoByUserIdWithTodoId(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest): Promise<UpdateTodoRequest> {
  return await updateTodoByUserIdAndTodoId(userId,todoId,updateTodoRequest);
}

export async function deleteTodoByUserIdAndTodoId(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return await deleteTodoByUserIdWithTodoId(userId,todoId);
}

export async function searchTodosByName(
  userId: string,
  keyword: string
): Promise<TodoItem[]> {
  return await searchTodos(userId, keyword);
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  const uploadUrl = await attachmentUtils.getUploadUrl(todoId);
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
  await updateTodoAttachmentUrl(userId,todoId,attachmentUrl)
  return uploadUrl;
}