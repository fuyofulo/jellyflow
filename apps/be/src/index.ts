import express from 'express';
import { userRouter } from './router/user';
import { zapRouter } from './router/zap';
const app = express();
app.use(express.json());
app.listen(5000);

app.use('/api/v1/user', userRouter);
app.use('/api/v1/zap', zapRouter);