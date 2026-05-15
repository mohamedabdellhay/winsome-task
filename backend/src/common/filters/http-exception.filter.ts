import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception.getResponse();

    const errors =
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "message" in exceptionResponse
        ? Array.isArray((exceptionResponse as any).message)
          ? (exceptionResponse as any).message
          : [(exceptionResponse as any).message]
        : [exception.message];

    response.status(status).json({
      success: false,
      statusCode: status,
      message:
        status === HttpStatus.BAD_REQUEST && errors.length > 0
          ? errors[0]
          : exception.message,
      errors,
    });
  }
}
