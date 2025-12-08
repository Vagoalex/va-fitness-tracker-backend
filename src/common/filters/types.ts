/**
 * Интерфейс стандартного ответа HttpException от NestJS
 * Используется для типизации ответа исключения
 */
export interface NestHttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
