import {
  verifyToken,
  shouldRefreshToken,
  refreshTokens,
  setAuthCookies,
} from '#utils';
import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException } from '#exceptions';

export const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
      throw new UnauthorizedException(ERROR_MESSAGE.NO_AUTH_TOKEN);
    }

    const payload = verifyToken(accessToken, 'access');
    if (!payload) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    req.user = { id: payload.userId };

    if (shouldRefreshToken(payload) && refreshToken) {
      const newTokens = await refreshTokens(refreshToken);
      if (newTokens) {
        setAuthCookies(res, newTokens);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
