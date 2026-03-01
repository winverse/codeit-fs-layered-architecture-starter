import express from 'express';
import { HTTP_STATUS, ERROR_MESSAGE } from '#constants';
import { usersRepository } from '#repository';
import { authMiddleware, validate } from '#middlewares';
import {
  createUserSchema,
  idParamSchema,
  updateUserSchema,
} from './users.schema.js';
import { ForbiddenException, NotFoundException } from '#exceptions';

export const usersRouter = express.Router();

// GET /api/users - 모든 사용자 조회
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await usersRepository.findAllUsers();
    res.status(HTTP_STATUS.OK).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - 특정 사용자 조회
usersRouter.get(
  '/:id',
  validate('params', idParamSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await usersRepository.findUserById(id);

      if (!user) {
        throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json(user);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/users - 새 사용자 생성
usersRouter.post(
  '/',
  validate('body', createUserSchema),
  async (req, res, next) => {
    try {
      const { email, name } = req.body;

      const newUser = await usersRepository.createUser({
        email,
        name,
      });

      res.status(HTTP_STATUS.CREATED).json(newUser);
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/users/:id - 사용자 정보 수정
usersRouter.patch(
  '/:id',
  authMiddleware,
  validate('params', idParamSchema),
  validate('body', updateUserSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      if (req.user.id !== id) {
        throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN_RESOURCE);
      }

      const existingUser = await usersRepository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
      }

      const updatedUser = await usersRepository.updateUser(id, { email, name });

      res.status(HTTP_STATUS.OK).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/users/:id - 사용자 삭제
usersRouter.delete(
  '/:id',
  authMiddleware,
  validate('params', idParamSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (req.user.id !== id) {
        throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN_RESOURCE);
      }

      const existingUser = await usersRepository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
      }

      await usersRepository.deleteUser(id);

      res.sendStatus(HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  },
);
