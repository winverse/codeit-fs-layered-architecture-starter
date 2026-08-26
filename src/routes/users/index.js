import express from 'express';
import { usersRouter } from './users.routes.js';

export const userRouter = express.Router();

userRouter.use('/', usersRouter);
