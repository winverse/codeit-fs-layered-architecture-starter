import express from 'express';
import { HTTP_STATUS, ERROR_MESSAGE } from '#constants';
import { userRepository } from '#repositories';
import { authMiddleware, validate } from '#middlewares';
import {
  createUserSchema,
  userIdParamSchema,
  updateUserSchema,
} from './users-schemas.js';
import { ForbiddenException, NotFoundException } from '#exceptions';
import { hashPassword } from '#utils';

export const usersRouter = express.Router();

// GET /api/users - 모든 사용자 조회
usersRouter.get('/', async (req, res) => {
  const users = await userRepository.findAll();
  const usersWithoutPassword = users.map(({ password: _, ...user }) => user);
  res.status(HTTP_STATUS.OK).json(usersWithoutPassword);
});

// GET /api/users/:userId - 특정 사용자 조회
usersRouter.get(
  '/:userId',
  validate('params', userIdParamSchema),
  async (req, res) => {
    const { userId } = req.params;
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(HTTP_STATUS.OK).json(userWithoutPassword);
  },
);

// POST /api/users - 새 사용자 생성
usersRouter.post('/', validate('body', createUserSchema), async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await hashPassword(password);

  const newUser = await userRepository.create({
    email,
    password: hashedPassword,
    name,
  });

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(HTTP_STATUS.CREATED).json(userWithoutPassword);
});

// PATCH /api/users/:userId - 사용자 정보 수정
usersRouter.patch(
  '/:userId',
  authMiddleware,
  validate('params', userIdParamSchema),
  validate('body', updateUserSchema),
  async (req, res) => {
    const { userId } = req.params;
    const { email, name } = req.body;

    if (req.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const updatedUser = await userRepository.update(userId, { email, name });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(HTTP_STATUS.OK).json(userWithoutPassword);
  },
);

// DELETE /api/users/:userId - 사용자 삭제
usersRouter.delete(
  '/:userId',
  authMiddleware,
  validate('params', userIdParamSchema),
  async (req, res) => {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    await userRepository.delete(userId);

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  },
);
