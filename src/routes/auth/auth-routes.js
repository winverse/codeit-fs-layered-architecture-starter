import express from 'express';
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  hashPassword,
  comparePassword,
} from '#utils';
import { authMiddleware, validate } from '#middlewares';
import { HTTP_STATUS, ERROR_MESSAGE } from '#constants';
import { signUpSchema, loginSchema } from './auth-schemas.js';
import { userRepository } from '#repositories';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '#exceptions';

export const authRouter = express.Router();

// POST /api/auth/signup - 회원가입
authRouter.post(
  '/signup',
  validate('body', signUpSchema),
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
      }

      const hashedPassword = await hashPassword(password);

      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      const tokens = generateTokens(user);
      setAuthCookies(res, tokens);

      const { password: _, ...userWithoutPassword } = user;
      res.status(HTTP_STATUS.CREATED).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/auth/login - 로그인
authRouter.post(
  '/login',
  validate('body', loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGE.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(ERROR_MESSAGE.INVALID_CREDENTIALS);
      }

      const tokens = generateTokens(user);
      setAuthCookies(res, tokens);

      const { password: _, ...userWithoutPassword } = user;
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/auth/logout - 로그아웃
authRouter.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.sendStatus(HTTP_STATUS.NO_CONTENT);
});

// GET /api/auth/me - 내 정보 조회
authRouter.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(HTTP_STATUS.OK).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});
