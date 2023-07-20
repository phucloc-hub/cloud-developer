import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { todoCreating } from '../../helpers/todos'

//import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    console.log(newTodo)
    // TODO: Implement creating a new TODO item
    const createdTodo = await todoCreating(newTodo, event);
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdTodo
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
