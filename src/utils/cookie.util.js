import { config } from '#config';
import { MINUTE_IN_MS, DAY_IN_MS } from '#constants';

// 인증 쿠키 설정
export const setAuthCookies = (res, tokens) => {
  const { accessToken, refreshToken } = tokens;

  // Access Token 쿠키
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // JavaScript로 접근 불가 (XSS 방지)
    secure: config.NODE_ENV === 'production', // HTTPS에서만 전송
    sameSite: 'lax', // 크로스 사이트 요청 제한 (CSRF 방지)
    maxAge: 15 * MINUTE_IN_MS, // 15분
    path: '/', // 모든 경로에서 쿠키 전송
  });

  // Refresh Token 쿠키
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * DAY_IN_MS, // 7일
    path: '/',
  });
};

// 인증 쿠키 삭제 (로그아웃 시)
export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};
