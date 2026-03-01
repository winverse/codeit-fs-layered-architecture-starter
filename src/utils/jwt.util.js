import jwt from 'jsonwebtoken';
import { config } from '#config';
import { MINUTE_IN_SECONDS } from '#constants';
import { usersRepository } from '#repository';

// Access Token 생성 (15분 유효)
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
    },
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
    },
  );
};

// Refresh Token 생성 (7일 유효)
export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, config.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Access Token + Refresh Token 동시 생성
export const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

// 토큰 검증
export const verifyToken = (token, tokenType = 'access') => {
  try {
    const secret =
      tokenType === 'access'
        ? config.JWT_ACCESS_SECRET
        : config.JWT_REFRESH_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

// Access Token 자동 갱신 (만료 5분 전)
export const shouldRefreshToken = (payload) => {
  if (!payload || !payload.exp) return false;

  const expiresIn = payload.exp - Math.floor(Date.now() / 1000);

  return expiresIn < MINUTE_IN_SECONDS * 5 && expiresIn > 0;
};

// Refresh Token으로 새 Access Token 발급
export const refreshTokens = async (refreshToken) => {
  const payload = verifyToken(refreshToken, 'refresh');

  if (!payload) {
    return null;
  }

  const user = await usersRepository.findUserById(payload.userId);
  if (!user) {
    return null;
  }

  return generateTokens({ id: user.id, name: user.name });
};
