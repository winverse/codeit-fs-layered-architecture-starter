import express from 'express';
import { userRouter } from './users/index.js';
import { authRouter } from './auth/index.js';
import { HTTP_STATUS } from '#constants';

export const router = express.Router();

router.get('/', (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .send({ now: new Date().toISOString(), message: 'OK' });
});

router.use('/users', userRouter);
router.use('/auth', authRouter);
