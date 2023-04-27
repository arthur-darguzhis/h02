import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from './common/exceptions/domain.exceptions/domain.exception';
import { EntityNotFoundException } from './common/exceptions/domain.exceptions/entity-not-found.exception';
import { EntityAlreadyExistsException } from './common/exceptions/domain.exceptions/entity-already-exists.exception';
import { UnprocessableEntityException } from './common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UnauthorizedActionException } from './common/exceptions/domain.exceptions/unauthorized-action.exception';
import * as process from 'process';

@Catch(HttpException)
export class HttpExceptionFilters implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();
      responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));
      response.status(status).json(errorResponse);

      console.log('=>>> params:' + JSON.stringify(request.params));
      console.log('=>>> body:' + JSON.stringify(request.body));
      console.log('=>>> query:' + JSON.stringify(request.query));
      console.log(`=>>> ${status}` + JSON.stringify(errorResponse));
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.BAD_REQUEST;
    switch (true) {
      case exception instanceof EntityNotFoundException:
        statusCode = HttpStatus.NOT_FOUND;
        break;
      case exception instanceof UnauthorizedActionException:
        statusCode = HttpStatus.FORBIDDEN;
        break;
      case exception instanceof EntityAlreadyExistsException:
      case exception instanceof UnprocessableEntityException:
        statusCode = HttpStatus.BAD_REQUEST;
    }

    const errors = { errorsMessages: [] };
    if (exception.property) {
      errors.errorsMessages.push({
        message: exception.message,
        field: exception.property,
      });
    } else {
      errors.errorsMessages.push({ message: exception.message });
    }

    response.status(statusCode).send(errors);
  }
}

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log('=>>> 500 message: ' + exception.toString());
    console.log('=>>> 500 stack: ' + exception.stack);
    console.log('=>>> 500 END of the stack');
    if (process.env.NODE_ENV !== 'production') {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Some error occurred');
    }
  }
}
