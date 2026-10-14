import express from 'express';
import { usersRouter } from './users/users-routes.js';
import { authRouter } from './auth/auth-routes.js';
import { HTTP_STATUS } from '#constants';

export const router = express.Router();

router.get('/ping', (req, res) => {
  const message = `현재 시간:${new Date().toISOString()}`;
  res.status(HTTP_STATUS.OK).json({ message });
});

router.use('/users', usersRouter);
router.use('/auth', authRouter);
