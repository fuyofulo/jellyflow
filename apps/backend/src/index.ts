// src/index.ts
import express from 'express';
import { userRouter } from './router/user';
import { zapRouter } from './router/zap';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';


const app = express();

// Common middleware
app.use(express.json());
app.use(cors());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/zap', zapRouter);

app.listen(3033);

