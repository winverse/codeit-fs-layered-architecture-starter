import express from 'express';
import { userRouter } from './users/index.js';
import { authRouter } from './auth/index.js';
import { HTTP_STATUS } from '#constants';

export const router = express.Router();

router.get('/ping', (req, res) => {
  const message = `현재 시간:${new Date().toISOString()}`;
  res.status(HTTP_STATUS.OK).json({ message });
});

router.use('/users', userRouter);
router.use('/auth', authRouter);
