import { DB_ERROR, ERROR_MESSAGE, HTTP_STATUS } from '#constants';
import { HttpException } from '#exceptions';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // express.json 같은 미들웨어가 붙인 4xx 오류(JSON 문법 오류는 400, 본문 크기 초과는 413)
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      message: ERROR_MESSAGE.BAD_REQUEST,
    });
  }

  // 23505: 고유 제약 위반(이미 사용 중인 값)
  if (err.sqlState === DB_ERROR.UNIQUE_VIOLATION) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      message: ERROR_MESSAGE.RESOURCE_CONFLICT,
    });
  }

  // 처리되지 않은 모든 에러
  console.error(err.stack);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  });
};
