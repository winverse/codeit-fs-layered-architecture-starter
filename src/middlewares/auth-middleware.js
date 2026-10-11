import {
  verifyToken,
  shouldRefreshToken,
  refreshTokens,
  setAuthCookies,
  clearAuthCookies,
} from '#utils';
import { ERROR_MESSAGE } from '#constants';
import { UnauthorizedException } from '#exceptions';

export const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // 두 토큰이 모두 없으면 401로 막습니다.
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGE.NO_AUTH_TOKEN);
    }

    const payload = accessToken ? verifyToken(accessToken, 'access') : null;

    // Access Token이 유효하면 req.user를 채우고, 만료가 가까우면 쿠키 갱신을 시도합니다.
    if (payload) {
      req.user = { id: payload.userId };

      if (shouldRefreshToken(payload) && refreshToken) {
        const renewed = await refreshTokens(refreshToken);
        if (renewed) {
          setAuthCookies(res, renewed.tokens);
          req.user = { id: renewed.user.id };
        }
      }

      return next();
    }

    // Refresh Token이 없으면 쿠키를 지우고 401로 막습니다.
    if (!refreshToken) {
      clearAuthCookies(res);
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    // Refresh Token으로 인증을 복구하고 새 인증 쿠키를 설정합니다.
    const recovered = await refreshTokens(refreshToken);
    // 복구에 실패하면 쿠키를 지우고 401로 막습니다.
    if (!recovered) {
      clearAuthCookies(res);
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }

    setAuthCookies(res, recovered.tokens);
    req.user = { id: recovered.user.id };

    next();
  } catch (error) {
    next(error);
  }
};
