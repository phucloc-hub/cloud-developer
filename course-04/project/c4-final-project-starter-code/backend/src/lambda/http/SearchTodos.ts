import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { getUserId } from '../utils';
import { SearchTodoRequest } from '../../requests/SearchTodoRequest';
import { searchTodosByName } from '../../helpers/todos';
// import { searchTodosByName } from '../../helpers/todos';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const request: SearchTodoRequest = JSON.parse(event.body);
    const tasks = await searchTodosByName(getUserId(event), request.keyword);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: tasks
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
