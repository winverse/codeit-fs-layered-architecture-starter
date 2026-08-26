import express from 'express';
import { authRouter as routes } from './auth.routes.js';

export const authRouter = express.Router();

authRouter.use('/', routes);
