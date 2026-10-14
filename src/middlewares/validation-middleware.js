import { isProduction } from '#config';
import { flattenError } from 'zod';
import { ERROR_MESSAGE } from '#constants';
import { BadRequestException } from '#exceptions';

/**
 * 범용 검증 미들웨어
 * @param {string} target - 검증할 대상 ('body', 'params', 'query')
 * @param {ZodSchema} schema - Zod 스키마
 */
export const validate = (target, schema) => {
  if (!['body', 'query', 'params'].includes(target)) {
    throw new Error(
      `[validate middleware] Invalid target: "${target}". Expected "body", "query", or "params".`,
    );
  }
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const { fieldErrors } = flattenError(result.error);

        if (isProduction) {
          throw new BadRequestException(ERROR_MESSAGE.INVALID_INPUT);
        }

        throw new BadRequestException(
          ERROR_MESSAGE.VALIDATION_FAILED,
          fieldErrors,
        );
      }

      // Express 5의 req.query는 읽을 때마다 새로 만드는 getter라서 Object.assign으로 바꾼 값이 남지 않으므로 속성을 다시 정의합니다.
      if (target === 'query') {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        Object.assign(req[target], result.data);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
