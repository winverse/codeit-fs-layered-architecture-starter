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
  const { accessToken, refreshToken } = req.cookies;

  // 두 토큰이 모두 없으면 401로 막습니다.
  if (!accessToken && !refreshToken) {
    throw new UnauthorizedException(ERROR_MESSAGE.NO_AUTH_TOKEN);
  }

  // Access Token이 유효하지 않거나 만료가 가까우면 Refresh Token으로 새 토큰을 발급받습니다.
  const payload = accessToken ? verifyToken(accessToken, 'access') : null;
  const needsRenewal = !payload || shouldRefreshToken(payload);
  const renewed =
    needsRenewal && refreshToken ? await refreshTokens(refreshToken) : null;

  if (renewed) {
    setAuthCookies(res, renewed.tokens);
    req.user = { id: renewed.user.id };
    return next();
  }

  // 새 토큰을 받지 못했어도 Access Token이 유효하면 그대로 통과시킵니다.
  if (payload) {
    req.user = { id: payload.userId };
    return next();
  }

  // 인증할 수 없으면 쿠키를 지우고 401로 막습니다.
  clearAuthCookies(res);
  throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
};
